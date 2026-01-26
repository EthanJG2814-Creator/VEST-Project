namespace VEST.Interfaces
{
    /// <summary>
    /// This is the interface for the API messenger. All API calls will be sent through this, allowing for easier management of API requests.
    /// </summary>
    public interface IAPIMessenger
    {
        #region Static Variables
        /// <summary>
        /// The HTTP client used for sending requests. This will only be initialized once, at the start of the program.
        /// </summary>
        protected static readonly HttpClient client = new();
        #endregion
        #region Protected Methods
        /// <summary>
        /// This method sends an HTTP request using the given <paramref name="request"/> and returns the <paramref name="response"/>.
        /// </summary>
        /// <param name="request">The request to be sent.</param>
        /// <param name="response">The response recieved from the call.</param>
        /// <returns>Whether or not the call succeeded or not.</returns>
        protected abstract bool SendInfo(HttpRequestMessage request, out HttpResponseMessage? response);
        /// <summary>
        /// Sends the <paramref name="request"/> asynchronously and returns a value indicating whether the operation was
        /// successful, along with the HTTP response message.
        /// </summary>
        /// <param name="request">The HTTP request message to send. Cannot be null.</param>
        /// <returns>A task that represents the asynchronous operation. The task result contains a tuple with a Boolean value
        /// indicating whether the request was sent successfully, and the corresponding HTTP response message if
        /// available; otherwise, null.</returns>
        protected abstract Task<(bool success, HttpResponseMessage? response)> SendInfoAsync(HttpRequestMessage request);
        #endregion
        #region Public Methods
        /* Todo: As we work on this project, we will be adding more methods to this interface. This is where all api calls will be sent through. */
        #endregion
    }
}
