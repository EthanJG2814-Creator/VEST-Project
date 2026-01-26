namespace VEST.Structures
{
    /// <summary>
    /// The basic information about a dog.
    /// </summary>
    public readonly struct DogInfo(string name, string breed, DateTime birthDate, float weightKg, long microchipId)
    {
        public readonly string Name = name;
        public readonly string Breed = breed;
        public readonly DateTime BirthDate = birthDate;
        public readonly float WeightKg = weightKg;
        public readonly long MicrochipId = microchipId;

        public readonly TimeSpan Age => DateTime.Now - BirthDate;
    }
}
