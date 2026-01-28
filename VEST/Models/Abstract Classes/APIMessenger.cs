using Microsoft.Extensions.Logging;
using VEST.API;

namespace VEST.Models.Abstract_Classes
{
    /// <summary>
    /// The main class for handling API communication, including sending requests and managing retries for failed requests. Implement this class for specific API interactions.
    /// </summary>
    internal abstract class APIMessenger
    {
        #region Static Variables
        /// <summary>
        /// The HTTP client used for sending requests. This will only be initialized once, at the start of the program.
        /// </summary>
        protected static readonly HttpClient client = new();
        /// <summary>
        /// The throttler used to regulate API call rates. Currently set to allow 50 calls per minute.
        /// </summary>
        protected static readonly Throttler throttler = new(50, 60);

        /// <summary>
        /// This buffer stores HTTP requests that failed due to server errors (5xx status codes) for later retry.
        /// </summary>
        private static readonly Stack<HttpRequestMessage> requestBuffer = [];
        /// <summary>
        /// The lock used to ensure that only one retry operation is performed at a time in the <see cref="RetryBufferedRequests"/> method.
        /// </summary>
        private static readonly AsyncLock RetryRequestsLock = new();
        #endregion
        #region Protected Methods
        /// <summary>
        /// Sends the <paramref name="request"/> asynchronously and returns a value indicating whether the operation was
        /// successful, along with the HTTP response message.
        /// </summary>
        /// <param name="request">The HTTP request message to send. Cannot be null.</param>
        /// <returns>A task that represents the asynchronous operation. The task result contains a tuple with a Boolean value
        /// indicating whether the request was sent successfully, and the corresponding HTTP response message if
        /// available; otherwise, null.</returns>
        protected static async Task<(bool success, HttpResponseMessage? response)> SendInfo(HttpRequestMessage request)
        {
            HttpResponseMessage? response;
            try
            {
                await throttler.Call().ConfigureAwait(false); //Ensure we respect the rate limit.

                Program.Log.LogDebug("API Request of type {Method} to \"{RequestUri}\"", request.Method, request.RequestUri); //Log the request being sent.

                response = await client.SendAsync(request).ConfigureAwait(false); //Send the request.
                response.EnsureSuccessStatusCode(); //Throw if not a success code.

                if (requestBuffer.Count > 0)
                {
                    Program.Log.LogInformation("A successful request was sent to \"{RequestUri}\". Retrying buffered requests.", request.RequestUri);
#pragma warning disable CS4014 // This call is not awaited because we want it to run in the background. We handle concurrency within the method itself.
                    Task.Run(RetryBufferedRequests);
#pragma warning restore CS4014
                }

                return (true, response); //Return success.
            } catch (HttpRequestException e)
            {
                if (e.StatusCode is not null)
                {
                    int code = (int)e.StatusCode;
                    Program.Log.LogWarning("API error (HTTP {StatusCode}) when sending request to \"{RequestUri}\": {Message}", code, request.RequestUri, e.Message);
                    //TODO: Find what status code means there was a failure to connect to the server.
                    if (code >= 500 && code < 600)
                    {
                        Program.Log.LogInformation("Buffering request to \"{RequestUri}\" for retry later.", request.RequestUri);
                        requestBuffer.Push(request);
                    }
                }
            } catch (Exception e)
            {
                Program.Log.LogError(e, "An unexpected error occurred while sending the HTTP request.");
            }
            return (false, null);
        }
        /// <summary>
        /// Synchronously sends the <paramref name="request"/> and outputs a response message (null if failed). Returns whether the operation was successful.
        /// </summary>
        /// <param name="request">The request to send.</param>
        /// <param name="response">The response for a given request.</param>
        /// <returns>Whether or not the operation was successful.</returns>
        protected static bool SendInfo(HttpRequestMessage request, out HttpResponseMessage? response)
        {
            bool outp;
            (outp, response) = SendInfo(request).GetAwaiter().GetResult();
            return outp;
        }
        #endregion
        #region Public Methods
        /// <summary>
        /// Attempts to resend all buffered HTTP requests that previously failed and are pending retry.
        /// </summary>
        /// <remarks>
        /// If another retry operation is already in progress, this method does not perform any
        /// retries and returns immediately. Successfully retried requests are removed from the buffer; requests that
        /// fail again during this operation are discarded. This method is thread-safe and prevents concurrent retry
        /// operations.
        /// </remarks>
        /// <returns>A task that represents the asynchronous retry operation.</returns>
        public static async Task RetryBufferedRequests()
        {
            AsyncLock.Releaser? theLock = await RetryRequestsLock.TryLockAsync();
            if (theLock is null)
            {
                Program.Log.LogWarning("Another retry operation is already in progress. Skipping this retry attempt.");
                return;
            }
            using (theLock.Value)
            {
                int initialCount = requestBuffer.Count;
                int successCount = 0;
                Program.Log.LogInformation("Retrying {Count} buffered requests.", initialCount);
                while (requestBuffer.Count > 0)
                {
                    HttpRequestMessage request = requestBuffer.Pop();
                    var (success, _) = await SendInfo(request).ConfigureAwait(false);
                    if (success)
                    {
                        successCount++;
                    }
                    else
                        Program.Log.LogWarning("Request to \"{RequestUri}\" failed again during retry. It will be discarded.", request.RequestUri);
                }
                Program.Log.LogInformation("Retried {InitialCount} buffered requests with {SuccessCount} successes.", initialCount, successCount);
            }
        }
        #endregion
    }
}
