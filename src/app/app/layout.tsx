import { StoreProvider } from "@/lib/store";
import Frame from "@/components/frame/Frame";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <StoreProvider>
      <Frame>{children}</Frame>
    </StoreProvider>
  );
}
