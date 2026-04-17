import { useParams, Link } from "react-router-dom";
import { Layout } from "@/Top/Component/Layout/Index";
import { getCollection, getChapter } from "@/Bottom/API/Hadith";
import { Container } from "@/Top/Component/UI/Container";
import { Button } from "@/Top/Component/UI/Button";

const Hadith_Chapter = () => {
  const { Collection, Chapter } = useParams<{ Collection: string; Chapter: string }>();

  const collection = Collection ? getCollection(Collection) : null;
  const chapter = Collection && Chapter ? getChapter(Collection, Chapter) : null;

  if (!collection || !chapter) {
    return (
      <Layout>
        <div className="py-16 text-center">
          <Container className="max-w-md mx-auto p-8">
            <h1 className="text-2xl font-semibold mb-4">Chapter Not Found</h1>
            <Link to="/Hadith">
              <Button>Back to Hadith</Button>
            </Link>
          </Container>
        </div>
      </Layout>
    );
  }

  // Extract just the hadith IDs
  const hadithIds = chapter.hadiths.map(h => h.id);

  return (
    <Layout>
      <div className="max-w-4xl mx-auto">
        <Container className="p-6 mb-6">
          <div className="flex items-center justify-between">
            <Link to={`/Hadith/${collection.slug}`}>
              <Button variant="outline" size="sm">
                ← Back to Collections
              </Button>
            </Link>
            <h1 className="text-2xl font-bold">{chapter.name}</h1>
            <div className="w-20" />
          </div>
          <p className="text-sm text-muted-foreground text-center mt-2">
            {chapter.hadithCount} hadiths in this chapter
          </p>
        </Container>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 p-4">
          {hadithIds.map((id) => (
            <Link key={id} to={`/Hadith/${collection.slug}/${Chapter}/${id}`}>
              <Button
                variant="outline"
                className="w-full h-16 text-lg font-semibold hover:scale-105 transition-transform"
              >
                {id}
              </Button>
            </Link>
          ))}
        </div>
      </div>
    </Layout>
  );
};

export default Hadith_Chapter;