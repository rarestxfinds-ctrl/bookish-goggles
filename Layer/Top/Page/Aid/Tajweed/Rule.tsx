import { useParams, Link } from "react-router-dom";
import { Layout } from "@/Top/Component/Layout/Index";
import { getTajweedCategoryDetail, getTajweedSubfolderSubcategory, getTajweedSubcategory } from "@/Bottom/API/Aid";
import { ChevronLeft } from "lucide-react";
import { Button } from "@/Top/Component/UI/Button";
import { Container } from "@/Top/Component/UI/Container";

export default function TajweedRule() {
  const { categoryId, subfolderId, subcategoryId } = useParams<{
    categoryId: string;
    subfolderId?: string;
    subcategoryId: string;
  }>();

  let category = getTajweedCategoryDetail(categoryId || "");
  let subcategory: any = undefined;

  if (subfolderId) {
    // Nested: category/folder/subcategory
    subcategory = getTajweedSubfolderSubcategory(categoryId || "", subfolderId, subcategoryId || "");
  } else {
    // Flat: category/subcategory
    subcategory = getTajweedSubcategory(categoryId || "", subcategoryId || "");
  }

  if (!category || !subcategory) {
    return (
      <Layout>
        <div className="container py-12 text-center">
          <p className="text-muted-foreground mb-4">Rule not found</p>
          <Link to="/Aid/Tajweed">
            <Button className="gap-2">
              <ChevronLeft className="h-4 w-4" /> Back to Tajweed
            </Button>
          </Link>
        </div>
      </Layout>
    );
  }

  const backPath = subfolderId
    ? `/Aid/Tajweed/${category.id}/folder/${subfolderId}`
    : `/Aid/Tajweed/${category.id}`;

  return (
    <Layout>
      <div className="container py-8 max-w-4xl mx-auto px-4">
        <Container className="!p-5 mb-6">
          <div className="flex items-center gap-2 flex-wrap">
            <h1 className="text-2xl font-bold">{subcategory.name}</h1>
            {subcategory.arabicName && (
              <p className="font-arabic text-xl text-muted-foreground" dir="rtl">
                {subcategory.arabicName}
              </p>
            )}
          </div>
          <p className="text-muted-foreground mt-2">{subcategory.description}</p>
        </Container>

        <div>
          {subcategory.rules.map((rule: any, index: number) => (
            <Container key={index} className="!p-5 mb-3">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-muted-foreground">
                    {rule.transliteration}
                  </span>
                  <Container className="!py-1 !px-3 !w-auto">
                    <span className="font-arabic text-2xl" dir="rtl">
                      {rule.letter}
                    </span>
                  </Container>
                </div>
                <p className="text-sm text-foreground">{rule.description}</p>
                {rule.example && (
                  <Container className="!p-3">
                    <div className="space-y-2">
                      <p className="text-xs text-muted-foreground uppercase tracking-wider font-medium">
                        Example
                      </p>
                      <p className="font-arabic text-2xl text-foreground" dir="rtl">
                        {rule.example}
                      </p>
                      {rule.exampleTranslation && (
                        <p className="text-sm text-muted-foreground italic">
                          {rule.exampleTranslation}
                        </p>
                      )}
                    </div>
                  </Container>
                )}
              </div>
            </Container>
          ))}
        </div>
      </div>
    </Layout>
  );
}