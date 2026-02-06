namespace VEST.Models.Structures
{
    internal struct FixedBuffer<T>(int capacity)
    {
        private readonly T[] buffer = new T[capacity];
        private int count = 0;

        public readonly int Count => count;
        public readonly int Capacity => buffer.Length;

        public void Add(T item)
        {
            if (count >= buffer.Length) throw new InvalidOperationException("Buffer is full.");
            buffer[count++] = item;
        }
        public void AddRange(IEnumerable<T> items)
        {
            foreach (T item in items)
            {
                if (count >= buffer.Length) throw new InvalidOperationException("Buffer is full.");
                buffer[count++] = item;
            }
        }
        public void Clear() => count = 0;

        private readonly IEnumerable<T> FlushLength(int i, int len)
        {
            for (; i < len; i++)
                yield return buffer[i];
        }
        public IEnumerable<T> FlushAll()
        {
            for (int i = 0; i < count; i++)
                yield return buffer[i];
            Clear();
        }
        public IEnumerable<T>[] FlushToLength(int n)
        {
            if (count % n != 0) throw new InvalidOperationException("Count must be a multiple of n.");
            IEnumerable<T>[] outp = new IEnumerable<T>[count / n];
            for (int i = 0, j = 0; i < count; i += n, j++)
                outp[j] = FlushLength(i, i + n);
            Clear();
            return outp;
        }

        public readonly T this[int i]
        {
            get
            {
                if (i < 0 || i >= count) throw new IndexOutOfRangeException(nameof(i));
                return buffer[i];
            }
        }
    }
}
