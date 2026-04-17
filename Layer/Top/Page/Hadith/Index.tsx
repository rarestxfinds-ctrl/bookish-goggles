import { Layout } from "@/Top/Component/Layout/Index";
import { Card } from "@/Top/Component/UI/Card";
import { hadithCollections } from "@/Bottom/API/Hadith";
import { useTranslation } from "@/Middle/Hook/Use-Translation";
import { Link } from "react-router-dom";

const Hadith = () => {
  const { t } = useTranslation();

  return (
    <Layout>
      <section className="py-8 md:py-12 flex justify-center w-full px-2 sm:px-4">
        <div className="flex flex-wrap gap-3 w-full">
          {hadithCollections.map((collection) => (
            <div key={collection.id} className="flex-1 min-w-[200px]">
              <Link to={`/Hadith/${collection.slug}`} className="block">
                <Card className="p-4 transition-all hover:scale-[1.02] group">
                  <h3 className="font-semibold text-base group-hover:text-white dark:group-hover:text-black">
                    {collection.name}
                  </h3>
                  <p className="text-sm text-muted-foreground mt-1 font-arabic group-hover:text-white dark:group-hover:text-black">
                    {collection.arabicName}
                  </p>
                  <p className="text-sm text-muted-foreground mt-1 group-hover:text-white dark:group-hover:text-black">
                    {collection.hadithCount.toLocaleString()} {t.hadiths.hadith}
                  </p>
                </Card>
              </Link>
            </div>
          ))}
        </div>
      </section>
    </Layout>
  );
};

export default Hadith;