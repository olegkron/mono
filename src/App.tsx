import { Navigator } from "./Navigator";
import { useTheme } from "./utils/useTheme";
import { siteConfig } from "./constants/config";

function App() {
  const { theme, toggle } = useTheme();
  return (
    <Navigator
      themeToggle={siteConfig.theme.showToggle ? { theme, toggle } : undefined}
    />
  );
}

export default App;
