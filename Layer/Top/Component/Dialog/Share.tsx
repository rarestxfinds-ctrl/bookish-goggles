import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/Top/Component/UI/Dialog";
import { Button } from "@/Top/Component/UI/Button";
import { Input } from "@/Top/Component/UI/Input";
import { Container } from "@/Top/Component/UI/Container";
import { toast } from "@/Middle/Hook/Use-Toast";
import { surahList } from "@/Bottom/API/Quran";
import { Copy, Facebook, Twitter, MessageCircle, Link2, Check, X } from "lucide-react";

interface ShareDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  surahId: number;
  ayahId?: number;
  verseText?: string;
  translation?: string;
}

export function ShareDialog({ open, onOpenChange, surahId, ayahId, verseText, translation }: ShareDialogProps) {
  const [copied, setCopied] = useState(false);
  
  const surah = surahList.find((s) => s.id === surahId);
  const verseRef = ayahId ? `${surah?.englishName} ${surahId}:${ayahId}` : surah?.englishName;
  const shareUrl = `${window.location.origin}/quran/surah/${surahId}${ayahId ? `?verse=${ayahId}` : ""}`;
  
  const shareText = translation 
    ? `"${translation}" - ${verseRef} (Al-Deen.org)`
    : `${verseRef} - Al-Deen.org`;

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      toast({ title: "Copied to clipboard" });
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast({ title: "Failed to copy", variant: "destructive" });
    }
  };

  const shareToSocial = (platform: string) => {
    const encodedText = encodeURIComponent(shareText);
    const encodedUrl = encodeURIComponent(shareUrl);
    
    const urls: Record<string, string> = {
      twitter: `https://twitter.com/intent/tweet?text=${encodedText}&url=${encodedUrl}`,
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}&quote=${encodedText}`,
      whatsapp: `https://wa.me/?text=${encodedText}%20${encodedUrl}`,
    };
    
    if (urls[platform]) {
      window.open(urls[platform], "_blank", "width=600,height=400");
    }
  };

  const copyVerse = () => {
    const fullText = verseText && translation
      ? `${verseText}\n\n${translation}\n\n- ${verseRef}`
      : shareText;
    copyToClipboard(fullText);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md p-0 bg-transparent border-0 shadow-none [&>button]:hidden">
        <Container className="!py-5 !px-6">
          <div className="flex items-center justify-between mb-4">
            <DialogHeader className="p-0">
              <DialogTitle className="text-lg font-semibold">
                Share {verseRef}
              </DialogTitle>
            </DialogHeader>
            <Button
              size="sm"
              className="w-8 h-8 p-0 rounded-full"
              onClick={() => onOpenChange(false)}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>

          <div className="space-y-5">
            {/* Verse preview */}
            {verseText && (
              <div className="p-4 rounded-[40px] bg-muted/30 space-y-2">
                <p className="text-right font-arabic text-lg leading-loose" dir="rtl">
                  {verseText}
                </p>
                {translation && (
                  <p className="text-sm text-muted-foreground leading-relaxed">{translation}</p>
                )}
                <p className="text-xs text-primary font-medium">- {verseRef}</p>
              </div>
            )}

            {/* Share buttons */}
            <div className="grid grid-cols-4 gap-2">
              <Button
                variant="secondary"
                className="flex flex-col gap-1 h-auto py-3"
                onClick={copyVerse}
              >
                {copied ? (
                  <Check className="h-4 w-4 text-green-500" />
                ) : (
                  <Copy className="h-4 w-4" />
                )}
                <span className="text-xs">Copy</span>
              </Button>
              
              <Button
                variant="secondary"
                className="flex flex-col gap-1 h-auto py-3"
                onClick={() => shareToSocial("twitter")}
              >
                <Twitter className="h-4 w-4" />
                <span className="text-xs">Twitter</span>
              </Button>
              
              <Button
                variant="secondary"
                className="flex flex-col gap-1 h-auto py-3"
                onClick={() => shareToSocial("facebook")}
              >
                <Facebook className="h-4 w-4" />
                <span className="text-xs">Facebook</span>
              </Button>
              
              <Button
                variant="secondary"
                className="flex flex-col gap-1 h-auto py-3"
                onClick={() => shareToSocial("whatsapp")}
              >
                <MessageCircle className="h-4 w-4" />
                <span className="text-xs">WhatsApp</span>
              </Button>
            </div>

            {/* Copy link */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Share Link</label>
              <div className="flex gap-2">
                <Input 
                  value={shareUrl} 
                  readOnly 
                  className="text-sm bg-transparent border-2 border-black dark:border-white rounded-[40px] focus:outline-none focus:border-primary"
                />
                <Button 
                  variant="secondary" 
                  size="sm"
                  className="w-9 h-9 p-0 rounded-full"
                  onClick={() => copyToClipboard(shareUrl)}
                >
                  <Link2 className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Native share */}
            {navigator.share && (
              <Button
                className="w-full"
                onClick={() => {
                  navigator.share({
                    title: verseRef,
                    text: shareText,
                    url: shareUrl,
                  });
                }}
              >
                More sharing options
              </Button>
            )}
          </div>
        </Container>
      </DialogContent>
    </Dialog>
  );
}