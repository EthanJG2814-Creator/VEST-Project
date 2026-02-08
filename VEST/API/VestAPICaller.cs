using Newtonsoft.Json.Linq;
using VEST.Models.Abstract_Classes;

namespace VEST.API
{
    internal class VestAPICaller : APIMessenger
    {
        /// <summary>
        /// The HTTP client used for sending requests. This will only be initialized once, at the start of the program.
        /// </summary>
        private static readonly HttpClient Client = new()
        {
            BaseAddress = new Uri(MAIN_API_URL), //Set the base address for the HTTP client to the main API URL.  
            DefaultRequestHeaders =
            {
                { "Accept", "application/json" }, //Set the default Accept header to indicate that we want JSON responses.
                { "User-Agent", "VEST API Client" }, //Set a custom User-Agent header for identification purposes.
                { "apikey", "sb_secret_JoarZAtTF5xUY1kpZzGvzQ_JKBgZcYW" } //Add the API key to the default request headers for authentication.
            }
        };
        /// <summary>
        /// Example method for calling the API. Replace this with actual API call methods as needed.
        /// </summary>
        /// <returns>A task that represents the asynchronous operation. The task result contains a Boolean value
        /// indicating whether the request was sent successfully, and the corresponding HTTP response message if
        /// available; otherwise, null.</returns>
        public static async Task<(bool success, HttpResponseMessage? response)> CallExampleEndpoint()
        {
            //?dog_id=58dd8ca7-9bd9-4de3-a671-7dc5a9bf5f4&device_id=49546760-2d35-41f7-8af0-faccaf3b4d5c&type_key=ppg_adc
            HttpRequestMessage request = new(HttpMethod.Get, $"{MAIN_API_URL}");
            return await SendInfo(request, Client);
        }

        public static async Task<(bool success, JToken? response)> SendReadings(string dogId, string deviceId, string typeKey, JToken data)
        {
            HttpRequestMessage request = new(HttpMethod.Post, $"{MAIN_API_URL}readings?dog_id={dogId}&device_id={deviceId}&type_key={typeKey}")
            {
                Content = new StringContent(data.ToString(), System.Text.Encoding.UTF8, "application/json")
            };
            var (success, response) = await SendInfo(request, Client);
            return (success, success ? JToken.Parse(await response!.Content.ReadAsStringAsync()) : null);
        }
    }
}
