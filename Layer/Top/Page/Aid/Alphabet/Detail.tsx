import { useParams, Link } from "react-router-dom";
import { Layout } from "@/Top/Component/Layout/Index";
import { getLetters, type Letter } from "@/Bottom/API/Aid";
import { Container } from "@/Top/Component/UI/Container";
import { Button } from "@/Top/Component/UI/Button";

const AlphabetDetail = () => {
  const { letterId } = useParams<{ letterId: string }>();
  const letters = getLetters();

  // Convert numeric ID (1‑based) to index
  const index = letterId ? parseInt(letterId, 10) - 1 : -1;
  const letter: Letter | undefined = index >= 0 && index < letters.length ? letters[index] : undefined;

  if (!letter) {
    return (
      <Layout>
        <div className="container py-16 text-center">
          <Container className="max-w-md mx-auto">
            <div className="p-8 text-center">
              <h1 className="text-2xl font-semibold mb-4">Letter Not Found</h1>
              <Link to="/Aid/Alphabet">
                <Button>Back to Alphabet</Button>
              </Link>
            </div>
          </Container>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <section className="py-6">
        <div className="container max-w-2xl mx-auto">
          <Container className="p-6 space-y-6">
            {/* Main letter display */}
            <div className="text-center space-y-3">
              <div className="font-arabic text-7xl md:text-8xl" dir="rtl">
                {letter.forms.isolated}
              </div>
              <h1 className="text-2xl font-bold">{letter.name}</h1>
              <p className="text-muted-foreground">{letter.arabicName}</p>
            </div>

            {/* Letter forms – without title */}
            <div className="border-t border-border pt-4">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
                <Container className="p-3 text-center">
                  <div className="text-sm text-muted-foreground mb-1">Isolated</div>
                  <div className="font-arabic text-3xl" dir="rtl">
                    {letter.forms.isolated}
                  </div>
                </Container>
                <Container className="p-3 text-center">
                  <div className="text-sm text-muted-foreground mb-1">Initial</div>
                  <div className="font-arabic text-3xl" dir="rtl">
                    {letter.forms.initial}
                  </div>
                </Container>
                <Container className="p-3 text-center">
                  <div className="text-sm text-muted-foreground mb-1">Medial</div>
                  <div className="font-arabic text-3xl" dir="rtl">
                    {letter.forms.medial}
                  </div>
                </Container>
                <Container className="p-3 text-center">
                  <div className="text-sm text-muted-foreground mb-1">Final</div>
                  <div className="font-arabic text-3xl" dir="rtl">
                    {letter.forms.final}
                  </div>
                </Container>
              </div>
            </div>
          </Container>
        </div>
      </section>
    </Layout>
  );
};

export default AlphabetDetail;