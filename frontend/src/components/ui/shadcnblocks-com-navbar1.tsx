import { Menu, Lock, Sun, Moon } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { useTheme } from "../../contexts/ThemeContext";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "./accordion";
import { Button } from "./button";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from "./navigation-menu";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "./sheet";

interface MenuItem {
  title: string;
  url: string;
  description?: string;
  items?: MenuItem[];
  locked?: boolean;
}

interface Navbar1Props {
  logo: {
    url: string;
    src: string;
    alt: string;
    title: string;
  };
  menu?: MenuItem[];
  mobileExtraLinks?: {
    name: string;
    url: string;
  }[];
  auth?: {
    login: {
      text: string;
      url: string;
    };
    signup: {
      text: string;
      url: string;
      onClick?: () => void;
    };
  };
}

const Navbar1 = ({
  logo,
  menu = [],
  mobileExtraLinks = [],
  auth = {
    login: { text: "Log in", url: "#" },
    signup: { text: "Sign up", url: "#" },
  },
}: Navbar1Props) => {
  const { pathname } = useLocation();
  const { theme, toggleTheme } = useTheme();

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white dark:bg-gray-950 w-full border-b border-gray-200 dark:border-gray-800 shadow-sm">
      <div className="max-w-7xl mx-auto px-6 py-4 bg-white dark:bg-gray-950">
        {/* Desktop nav */}
        <nav className="hidden lg:flex items-center justify-between">
          <div className="flex items-center gap-6">
            <Link
              to={logo.url}
              className="flex items-center gap-2.5 rounded-lg focus:outline-none"
              aria-label="Go to home page"
            >
              <img src={logo.src} className="w-8 h-8" alt={logo.alt} />
              <span className="text-xl font-extrabold text-black dark:text-white tracking-tight">
                {logo.title}
              </span>
            </Link>
            <NavigationMenu>
              <NavigationMenuList>
                {menu.map((item) => renderMenuItem(item))}
              </NavigationMenuList>
            </NavigationMenu>
          </div>
          <div className="flex gap-3 items-center">
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleTheme}
              className="h-10 w-10 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-white transition-colors duration-200 focus:outline-none focus:ring-0 rounded-lg p-0"
              aria-label="Toggle theme"
            >
              {theme === "light" ? (
                <Moon className="h-5 w-5" strokeWidth={2} />
              ) : (
                <Sun className="h-5 w-5" strokeWidth={2} />
              )}
            </Button>
            <Button
              asChild
              variant="outline"
              className="h-10 px-4 text-sm font-semibold text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800 active:bg-gray-100 dark:active:bg-gray-900 hover:text-gray-900 dark:hover:text-white hover:border-gray-300 dark:hover:border-gray-700 transition-colors duration-200 focus:outline-none focus:ring-0 rounded-lg"
            >
              <Link to={auth.login.url}>{auth.login.text}</Link>
            </Button>
            {auth.signup.onClick ? (
              <Button
                onClick={auth.signup.onClick}
                className="h-10 px-4 text-sm font-semibold bg-[#181818] text-white hover:bg-[#00C6A7] active:bg-[#181818] transition-colors duration-200 focus:outline-none focus:ring-0 rounded-lg border-0"
                aria-label={auth.signup.text}
              >
                {auth.signup.text}
              </Button>
            ) : (
              <Button
                asChild
                className="h-10 px-4 text-sm font-semibold bg-[#181818] text-white hover:bg-[#00C6A7] active:bg-[#181818] transition-colors duration-200 focus:outline-none focus:ring-0 rounded-lg border-0"
              >
                <Link to={auth.signup.url}>{auth.signup.text}</Link>
              </Button>
            )}
          </div>
        </nav>

        {/* Mobile nav */}
        <div className="flex lg:hidden items-center justify-between h-10">
          <Link
            to={logo.url}
            className="flex items-center gap-2.5 rounded-lg focus:outline-none"
            aria-label="Go to home page"
          >
            <img src={logo.src} className="w-8 h-8" alt={logo.alt} />
            <span className="text-xl font-extrabold text-black dark:text-white tracking-tight">
              {logo.title}
            </span>
          </Link>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleTheme}
              className="h-9 w-9 text-black dark:text-white hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors duration-200 focus:outline-none focus:ring-0 rounded-lg p-0"
              aria-label="Toggle theme"
            >
              {theme === "light" ? (
                <Moon className="h-5 w-5" strokeWidth={2} />
              ) : (
                <Sun className="h-5 w-5" strokeWidth={2} />
              )}
            </Button>
            <Sheet>
              <SheetTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-9 w-9 bg-transparent hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors duration-200 focus:outline-none focus:ring-0 rounded-lg p-0"
                  aria-label="Open navigation menu"
                >
                  <Menu className="h-5 w-5 text-black dark:text-white" strokeWidth={2} />
                </Button>
              </SheetTrigger>
            <SheetContent className="bg-white dark:bg-gray-950 w-[85vw] sm:w-[380px] p-0 border-l border-gray-200 dark:border-gray-800">
              <SheetHeader className="px-6 border-b border-gray-200 dark:border-gray-800 min-h-[72px] flex flex-row items-center dark:bg-gray-950">
                <SheetTitle className="text-left flex-1">
                  <Link
                    to={logo.url}
                    className="flex items-center gap-2.5 rounded-lg focus:outline-none"
                    aria-label="Go to home page"
                  >
                    <img src={logo.src} className="w-8 h-8" alt={logo.alt} />
                    <span className="text-xl font-extrabold text-black dark:text-white tracking-tight">
                      {logo.title}
                    </span>
                  </Link>
                </SheetTitle>
                <SheetDescription className="sr-only">
                  Navigation menu for KampusKart
                </SheetDescription>
              </SheetHeader>
              <div className="px-5 py-6 flex flex-col gap-5">
                <Accordion
                  type="single"
                  collapsible
                  className="flex w-full flex-col gap-3 bg-transparent"
                >
                  {menu.map((item) => renderMobileMenuItem(item, pathname))}
                </Accordion>
                {mobileExtraLinks.length > 0 && (
                  <div className="border-t border-gray-200 dark:border-gray-800 pt-4 mt-2">
                    <h3 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3 px-1">
                      Quick Access
                    </h3>
                    <div className="flex flex-col gap-2">
                      {mobileExtraLinks.map((link, idx) => (
                        <SheetClose key={idx} asChild>
                          <Link
                            to={link.url}
                            className={`inline-flex h-11 items-center justify-center rounded-lg px-4 py-3 text-sm font-semibold border transition-colors duration-200 focus:outline-none focus:ring-0 ${
                              isActivePath(pathname, link.url)
                                ? "text-[#00C6A7] bg-[#E6FFFA] border-[#00C6A7]"
                                : "text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800 active:bg-gray-100 dark:active:bg-gray-900 hover:text-gray-900 dark:hover:text-white hover:border-gray-300 dark:hover:border-gray-700"
                            }`}
                            aria-label={`Go to ${link.name}`}
                          >
                            {link.name}
                          </Link>
                        </SheetClose>
                      ))}
                    </div>
                  </div>
                )}
                <div className="flex flex-col gap-2 pt-4 mt-2 border-t border-gray-200 dark:border-gray-800">
                  <SheetClose asChild>
                    <Button
                      asChild
                      variant="outline"
                      className="w-full h-11 text-sm font-semibold text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800 active:bg-gray-100 dark:active:bg-gray-900 hover:text-gray-900 dark:hover:text-white hover:border-gray-300 dark:hover:border-gray-700 transition-colors duration-200 rounded-lg focus:outline-none focus:ring-0"
                    >
                      <Link to={auth.login.url}>{auth.login.text}</Link>
                    </Button>
                  </SheetClose>
                  {auth.signup.onClick ? (
                    <SheetClose asChild>
                      <Button
                        onClick={auth.signup.onClick}
                        className="w-full h-11 text-sm font-semibold bg-[#181818] text-white hover:bg-[#00C6A7] active:bg-[#181818] transition-colors duration-200 rounded-lg focus:outline-none focus:ring-0"
                        aria-label={auth.signup.text}
                      >
                        {auth.signup.text}
                      </Button>
                    </SheetClose>
                  ) : (
                    <SheetClose asChild>
                      <Button
                        asChild
                        className="w-full h-11 text-sm font-semibold bg-[#181818] text-white hover:bg-[#00C6A7] active:bg-[#181818] transition-colors duration-200 rounded-lg focus:outline-none focus:ring-0"
                      >
                        <Link to={auth.signup.url}>{auth.signup.text}</Link>
                      </Button>
                    </SheetClose>
                  )}
                </div>
              </div>
            </SheetContent>
          </Sheet>
          </div>
        </div>
      </div>
    </header>
  );
};

const isActivePath = (pathname: string, targetUrl: string) => {
  if (!targetUrl || targetUrl === "#") return false;
  if (targetUrl === "/") return pathname === "/";
  return pathname === targetUrl || pathname.startsWith(`${targetUrl}/`);
};

const renderMenuItem = (item: MenuItem) => {
  if (item.items) {
    return (
      <NavigationMenuItem key={item.title}>
        <NavigationMenuTrigger
          className="text-gray-700 dark:text-gray-200 font-semibold px-4 py-2 rounded-lg focus:outline-none focus:ring-0"
          aria-label={`${item.title} menu`}
        >
          {item.title}
        </NavigationMenuTrigger>
        <NavigationMenuContent>
          <ul className="w-80 p-2 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg shadow-lg">
            {item.items.map((subItem) => (
              <li key={subItem.title}>
                <NavigationMenuLink asChild>
                  <Link
                    to={subItem.locked ? "#" : subItem.url}
                    className={`flex select-none gap-3 rounded-lg p-3 leading-none no-underline outline-none transition-colors duration-200 focus:ring-0 ${
                      subItem.locked
                        ? "bg-gray-50 text-gray-400 cursor-not-allowed pointer-events-none"
                        : "hover:bg-gray-50 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-200 hover:text-gray-900 dark:hover:text-white"
                    }`}
                    aria-label={`Go to ${subItem.title}`}
                    tabIndex={subItem.locked ? -1 : undefined}
                    aria-disabled={subItem.locked}
                    onClick={(e) => {
                      if (subItem.locked) {
                        e.preventDefault();
                        e.stopPropagation();
                      }
                    }}
                  >
                    <div className="flex-1">
                      <div
                        className={`text-sm font-semibold flex items-center gap-2 ${
                          subItem.locked ? "text-gray-400" : "text-gray-900 dark:text-white"
                        }`}
                      >
                        {subItem.title}
                        {subItem.locked && <Lock className="h-3 w-3" />}
                      </div>
                      {subItem.description && (
                        <p
                          className={`text-xs leading-snug mt-1 ${
                            subItem.locked ? "text-gray-400" : "text-gray-600 dark:text-gray-400"
                          }`}
                        >
                          {subItem.description}
                          {subItem.locked && " • Sign in to access"}
                        </p>
                      )}
                    </div>
                  </Link>
                </NavigationMenuLink>
              </li>
            ))}
          </ul>
        </NavigationMenuContent>
      </NavigationMenuItem>
    );
  }

  return (
    <NavigationMenuItem key={item.title}>
      <NavigationMenuLink asChild>
        <Link
          to={item.url}
          className="inline-flex h-9 items-center justify-center rounded-lg px-4 py-2 text-sm font-semibold text-gray-700 dark:text-gray-200 bg-transparent transition-colors duration-200 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-white focus:outline-none focus:ring-0"
          aria-label={`Go to ${item.title}`}
        >
          {item.title}
        </Link>
      </NavigationMenuLink>
    </NavigationMenuItem>
  );
};

const renderMobileMenuItem = (item: MenuItem, pathname: string) => {
  if (item.items) {
    return (
      <AccordionItem key={item.title} value={item.title} className="border-none">
        <AccordionTrigger
          className="py-3 px-4 font-semibold text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-900 hover:bg-gray-50 dark:hover:bg-gray-800 active:bg-gray-100 dark:active:bg-gray-950 hover:text-gray-900 dark:hover:text-white data-[state=open]:text-gray-900 dark:data-[state=open]:text-white data-[state=open]:bg-gray-50 dark:data-[state=open]:bg-gray-800 transition-colors duration-200 rounded-lg text-sm focus:outline-none focus:ring-0 border border-gray-200 dark:border-gray-800 hover:no-underline"
          aria-label={`${item.title} menu`}
        >
          {item.title}
        </AccordionTrigger>
        <AccordionContent className="mt-2 pb-2">
          <div className="flex flex-col gap-2 pl-2">
            {item.items.map((subItem) => (
              subItem.locked ? (
                <Link
                  key={subItem.title}
                  to="#"
                  className="flex select-none gap-3 rounded-lg p-3 leading-none outline-none transition-colors duration-200 border focus:ring-0 bg-gray-50 dark:bg-gray-950 text-gray-400 cursor-not-allowed border-gray-200 dark:border-gray-800"
                  aria-label={`Go to ${subItem.title}`}
                  tabIndex={-1}
                  aria-disabled={true}
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                  }}
                >
                  <div className="flex-1">
                    <div className="text-sm font-semibold flex items-center gap-2 mb-1 text-gray-400">
                      {subItem.title}
                      <Lock className="h-3 w-3" />
                    </div>
                    {subItem.description && (
                      <p className="text-xs leading-snug text-gray-400">
                        {subItem.description} • Sign in to access
                      </p>
                    )}
                  </div>
                </Link>
              ) : (
                <SheetClose key={subItem.title} asChild>
                  <Link
                    to={subItem.url}
                    className={`flex select-none gap-3 rounded-lg p-3 leading-none outline-none transition-colors duration-200 border focus:ring-0 ${
                      isActivePath(pathname, subItem.url)
                        ? "bg-[#E6FFFA] text-[#00C6A7] border-[#00C6A7]"
                        : "bg-white dark:bg-gray-900 hover:bg-gray-50 dark:hover:bg-gray-800 active:bg-gray-100 dark:active:bg-gray-950 text-gray-700 dark:text-gray-200 hover:text-gray-900 dark:hover:text-white border-gray-200 dark:border-gray-800 hover:border-gray-300 dark:hover:border-gray-700"
                    }`}
                    aria-label={`Go to ${subItem.title}`}
                  >
                    <div className="flex-1">
                      <div className={`text-sm font-semibold flex items-center gap-2 mb-1 ${isActivePath(pathname, subItem.url) ? 'text-[#00A489] dark:text-[#00C6A7]' : 'text-gray-900 dark:text-white'}`}>
                        {subItem.title}
                      </div>
                      {subItem.description && (
                        <p className="text-xs leading-snug text-gray-600 dark:text-gray-400">
                          {subItem.description}
                        </p>
                      )}
                    </div>
                  </Link>
                </SheetClose>
              )
            ))}
          </div>
        </AccordionContent>
      </AccordionItem>
    );
  }

  return (
    <SheetClose key={item.title} asChild>
      <Link
        to={item.url}
        className={`flex h-11 items-center rounded-lg px-4 text-sm font-semibold transition-colors duration-200 border focus:outline-none focus:ring-0 ${
          isActivePath(pathname, item.url)
            ? "text-[#00C6A7] bg-[#E6FFFA] border-[#00C6A7]"
            : "text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-900 hover:bg-gray-50 dark:hover:bg-gray-800 active:bg-gray-100 dark:active:bg-gray-950 hover:text-gray-900 dark:hover:text-white border-gray-200 dark:border-gray-800 hover:border-gray-300 dark:hover:border-gray-700"
        }`}
        aria-label={`Go to ${item.title}`}
      >
        {item.title}
      </Link>
    </SheetClose>
  );
};

export { Navbar1 };
