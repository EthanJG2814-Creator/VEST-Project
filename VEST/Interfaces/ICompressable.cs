namespace VEST.Interfaces
{
    /// <summary>
    /// Defines a contract for objects that support Huffman compression for storage or transmission. T should be the implementing type.
    /// </summary>
    internal interface ICompressable<T>
    {
        /// <summary>
        /// Returns the uncompressed data as a byte array.
        /// </summary>
        /// <returns>A byte array containing the uncompressed data. The array is empty if there is no data available.</returns>
        public byte[] GetUncompressedData();
        /// <summary>
        /// Creates an instance of the type from the specified uncompressed byte array.
        /// </summary>
        /// <param name="data">The uncompressed data as a byte array. Must not be null.</param>
        /// <returns>An instance of the type created from the provided uncompressed data.</returns>
        public static abstract T FromUncompressedData(in byte[] data);
    }
}
