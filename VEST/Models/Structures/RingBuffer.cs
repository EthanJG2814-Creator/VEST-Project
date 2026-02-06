namespace VEST.Models.Structures
{
    internal struct RingBuffer<T>(int cap)
    {
        private readonly T[] values = new T[cap];
        private int head = 0, tail = 0;

        public readonly int Count => (tail - head + values.Length) % values.Length;
        public readonly int Capacity => values.Length;
        public readonly bool IsFull => (tail + 1) % values.Length == head;

        public void Add(T item)
        {
            values[tail] = item;
            tail = (tail + 1) % values.Length;
            if (tail == head) head = (head + 1) % values.Length; // Overwrite oldest if full
        }
        public void AddRange(IEnumerable<T> items)
        {
            foreach (T item in items) 
                Add(item);
        }
        public void Clear() => head = tail = 0;
        private readonly IEnumerable<T> FlushLength(int i, int len)
        {
            for (; i < len; i++)
                yield return values[i];
        }
        public IEnumerable<T> FlushAll()
        {
            for (int i = head; i != tail; i = (i + 1) % values.Length)
                yield return values[i];
            Clear();
        }
        public IEnumerable<T>[] FlushToLength(int n)
        {
            int count = Count;
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
                if (i < 0 || i >= Count) throw new IndexOutOfRangeException();
                return values[(head + i) % values.Length];
            }
        }
    }
}
