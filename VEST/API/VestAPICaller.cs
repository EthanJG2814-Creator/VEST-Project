using VEST.Models.Abstract_Classes;

namespace VEST.API
{
    internal class VestAPICaller : APIMessenger
    {
        /// <summary>
        /// Example method for calling the API. Replace this with actual API call methods as needed.
        /// </summary>
        /// <returns>A task that represents the asynchronous operation. The task result contains a Boolean value
        /// indicating whether the request was sent successfully, and the corresponding HTTP response message if
        /// available; otherwise, null.</returns>
        public static async Task<(bool success, HttpResponseMessage? response)> CallExampleEndpoint()
        {
            HttpRequestMessage request = new(HttpMethod.Get, $"{MAIN_API_URL}");
            return await SendInfo(request);
        }
    }
}
