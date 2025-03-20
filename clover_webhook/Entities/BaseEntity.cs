namespace clover_webhook.Entities
{
    public abstract partial class BaseEntity : ParentEntity
    {
        protected BaseEntity()
        {
            GenericAttributes = new List<GenericAttribute>();
        }

        public IList<GenericAttribute> GenericAttributes { get; set; }

    }
}