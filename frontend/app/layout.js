import "@/app/globals.css";
import { AuthProvider } from "@/context/AuthContext";

export const metadata = {
  title: "Dashboard",
  description: "Frontend foundation for the IoT dashboard",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
