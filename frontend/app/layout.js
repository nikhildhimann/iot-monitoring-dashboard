import "@/app/globals.css";
import { AuthProvider } from "@/context/AuthContext";

export const metadata = {
  title: "Amrik Dashboard",
  description: "Frontend foundation for the Amrik IoT dashboard",
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
