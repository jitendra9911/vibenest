import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Download, Smartphone, CheckCircle } from "lucide-react";
import { SiAndroid } from "react-icons/si";

export default function DownloadApp() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="max-w-2xl w-full">
        <CardHeader className="text-center space-y-4">
          <div className="mx-auto h-20 w-20 rounded-full bg-primary/10 flex items-center justify-center">
            <Smartphone className="h-10 w-10 text-primary" />
          </div>
          <CardTitle className="text-3xl font-display">Download VibeNest</CardTitle>
          <CardDescription className="text-base">
            Get the VibeNest app on your Android device and enjoy stories on the go!
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-6">
          {/* Features */}
          <div className="space-y-3">
            <h3 className="font-semibold text-lg flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-primary" />
              What You'll Get
            </h3>
            <ul className="space-y-2 text-muted-foreground">
              <li className="flex items-start gap-2">
                <CheckCircle className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                <span>Full-screen Instagram Reels-style story experience</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                <span>Read and share fictional stories, real experiences, or both</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                <span>Like, comment, and save your favorite stories</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                <span>Follow creators and get personalized story feeds</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                <span>Background music support for immersive reading</span>
              </li>
            </ul>
          </div>

          {/* Download Options */}
          <div className="space-y-4 pt-4 border-t">
            <h3 className="font-semibold text-lg">Download for Android</h3>
            
            {/* Direct APK Download */}
            <a 
              href="https://github.com/jitendra9911/vibenest/releases/latest/download/app-release.apk"
              download="VibeNest.apk"
              data-testid="link-download-apk"
            >
              <Button 
                className="w-full gap-2 h-12 hover-elevate active-elevate-2"
                data-testid="button-download-apk"
              >
                <Download className="h-5 w-5" />
                <div className="flex flex-col items-start">
                  <span>Download Latest APK</span>
                  <span className="text-xs opacity-80">Optimized Release • ~8 MB</span>
                </div>
              </Button>
            </a>

            {/* Google Play Store - Placeholder */}
            <Button 
              variant="outline"
              className="w-full gap-2 h-12 hover-elevate active-elevate-2"
              disabled
              data-testid="button-google-play"
            >
              <SiAndroid className="h-5 w-5" />
              Get it on Google Play (Coming Soon)
            </Button>

            <p className="text-sm text-muted-foreground text-center">
              <strong>Note:</strong> v1.0.6 with mobile authentication fix is ready - rebuild on GitHub to get the latest version
            </p>
          </div>

          {/* Installation Instructions */}
          <div className="bg-muted/50 p-4 rounded-lg space-y-2">
            <h4 className="font-semibold text-sm">How to install the APK:</h4>
            <ol className="text-sm text-muted-foreground space-y-1 list-decimal list-inside">
              <li>Download the APK file</li>
              <li>Go to Settings → Security</li>
              <li>Enable "Install from Unknown Sources"</li>
              <li>Open the downloaded APK file</li>
              <li>Follow the installation prompts</li>
            </ol>
          </div>

          {/* Back to Web App */}
          <div className="text-center pt-4">
            <a href="/">
              <Button variant="ghost" className="hover-elevate active-elevate-2">
                ← Back to Web App
              </Button>
            </a>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
