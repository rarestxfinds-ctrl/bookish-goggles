import { useState, useEffect } from "react";
import { Layout } from "@/Top/Component/Layout/Index";
import { MapPin, Loader2 } from "lucide-react";
import { QiblaCompass } from "@/Top/Component/Qibla-Compass";

const QiblaPage = () => {
  const [location, setLocation] = useState<{ latitude: number; longitude: number } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!navigator.geolocation) {
      setError("Geolocation is not supported by your browser.");
      setLoading(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLocation({ latitude: position.coords.latitude, longitude: position.coords.longitude });
        setLoading(false);
      },
      () => {
        fetch("https://ipapi.co/json/")
          .then((r) => r.json())
          .then((data) => {
            setLocation({ latitude: data.latitude, longitude: data.longitude });
            setLoading(false);
          })
          .catch(() => {
            setError("Unable to determine your location.");
            setLoading(false);
          });
      },
      { timeout: 5000 }
    );
  }, []);

  return (
    <Layout>
      <section className="py-6">
        <div className="container max-w-lg">
          <h1 className="text-2xl font-bold mb-6">Qibla Direction</h1>

          {loading ? (
            <div className="glass-card p-12 flex flex-col items-center justify-center gap-3">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <p className="text-muted-foreground text-sm">Getting your location...</p>
            </div>
          ) : error ? (
            <div className="glass-card p-8 text-center">
              <p className="text-muted-foreground">{error}</p>
            </div>
          ) : location ? (
            <QiblaCompass latitude={location.latitude} longitude={location.longitude} />
          ) : null}
        </div>
      </section>
    </Layout>
  );
};

export default QiblaPage;
