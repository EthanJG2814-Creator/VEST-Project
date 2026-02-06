using VEST.Models.Structures;

namespace VEST.Models.Data_Handling
{
    internal class DataBuffer<T>(int pointsPerSecond, int bufferTime)
    {
        private FixedBuffer<T> buffer = new(pointsPerSecond * bufferTime);

        public void SendPacket(IEnumerable<T> data) => buffer.AddRange(data);

        public IEnumerable<T>[] FlushPackets() => buffer.FlushToLength(pointsPerSecond);
    }
}
