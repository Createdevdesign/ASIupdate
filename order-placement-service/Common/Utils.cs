using RazorEngine;
using RazorEngine.Templating;


namespace order_placement_service.Common
{
    public class Utils
    {

        public static string CreateTemplate<T>(string template, T item)
        {
            //Engine.Razor.<T>(template,);
            return Engine.Razor.RunCompile(template, "templateKey", typeof(T), item);
        }
    }
}
