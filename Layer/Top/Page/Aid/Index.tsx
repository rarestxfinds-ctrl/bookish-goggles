import { Layout } from "@/Top/Component/Layout/Index";
import { Card } from "@/Top/Component/UI/Card";
import { useTranslation } from "@/Middle/Hook/Use-Translation";
import { Link } from "react-router-dom";

const Aid = () => {
  const { isRtl } = useTranslation();

  return (
    <Layout>
      <div className="flex flex-wrap gap-3 w-full" dir={isRtl ? "rtl" : "ltr"}>
        <div className="flex-1 min-w-[120px]">
          <Link to="/Aid/Prayers">
            <Card className="p-4 text-center hover:scale-[1.02] group">
              <span className="font-semibold text-base group-hover:text-white dark:group-hover:text-black">
                Prayers
              </span>
            </Card>
          </Link>
        </div>
        <div className="flex-1 min-w-[120px]">
          <Link to="/Aid/Qibla">
            <Card className="p-4 text-center hover:scale-[1.02] group">
              <span className="font-semibold text-base group-hover:text-white dark:group-hover:text-black">
                Qibla
              </span>
            </Card>
          </Link>
        </div>
        <div className="flex-1 min-w-[120px]">
          <Link to="/Aid/Hijri-Calendar">
            <Card className="p-4 text-center hover:scale-[1.02] group">
              <span className="font-semibold text-base group-hover:text-white dark:group-hover:text-black">
                Hijri Calendar
              </span>
            </Card>
          </Link>
        </div>
        <div className="flex-1 min-w-[120px]">
          <Link to="/Aid/Zakat-Calculator">
            <Card className="p-4 text-center hover:scale-[1.02] group">
              <span className="font-semibold text-base group-hover:text-white dark:group-hover:text-black">
                Zakat Calculator
              </span>
            </Card>
          </Link>
        </div>
        <div className="flex-1 min-w-[120px]">
          <Link to="/Aid/Tasbih">
            <Card className="p-4 text-center hover:scale-[1.02] group">
              <span className="font-semibold text-base group-hover:text-white dark:group-hover:text-black">
                Tasbih
              </span>
            </Card>
          </Link>
        </div>
        <div className="flex-1 min-w-[120px]">
          <Link to="/Aid/Dua">
            <Card className="p-4 text-center hover:scale-[1.02] group">
              <span className="font-semibold text-base group-hover:text-white dark:group-hover:text-black">
                Duas
              </span>
            </Card>
          </Link>
        </div>
        <div className="flex-1 min-w-[120px]">
          <Link to="/Aid/Alphabet">
            <Card className="p-4 text-center hover:scale-[1.02] group">
              <span className="font-semibold text-base group-hover:text-white dark:group-hover:text-black">
                Alphabet
              </span>
            </Card>
          </Link>
        </div>
        <div className="flex-1 min-w-[120px]">
          <Link to="/Aid/Tajweed">
            <Card className="p-4 text-center hover:scale-[1.02] group">
              <span className="font-semibold text-base group-hover:text-white dark:group-hover:text-black">
                Tajweed
              </span>
            </Card>
          </Link>
        </div>
      </div>
    </Layout>
  );
};

export default Aid;