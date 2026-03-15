// Subject-based gradient themes - shared across FolderCard and FolderView

export const getGradientTheme = (folderName: string) => {
  const name = folderName.toLowerCase();

  const lightGradients: Record<string, string> = {
    math: 'from-[hsl(210,85%,88%)] to-[hsl(230,70%,85%)]',
    mathematics: 'from-[hsl(210,85%,88%)] to-[hsl(230,70%,85%)]',
    science: 'from-[hsl(150,60%,85%)] to-[hsl(90,50%,88%)]',
    economics: 'from-[hsl(35,90%,85%)] to-[hsl(45,85%,82%)]',
    social: 'from-[hsl(180,55%,85%)] to-[hsl(190,50%,82%)]',
    english: 'from-[hsl(340,70%,88%)] to-[hsl(10,70%,85%)]',
    history: 'from-[hsl(270,60%,88%)] to-[hsl(280,50%,85%)]',
    default: 'from-[hsl(220,20%,92%)] to-[hsl(220,15%,88%)]',
  };

  const darkGradients: Record<string, string> = {
    math: 'dark:from-[hsl(230,45%,25%)] dark:to-[hsl(250,35%,22%)]',
    mathematics: 'dark:from-[hsl(230,45%,25%)] dark:to-[hsl(250,35%,22%)]',
    science: 'dark:from-[hsl(150,35%,22%)] dark:to-[hsl(160,30%,28%)]',
    economics: 'dark:from-[hsl(30,50%,28%)] dark:to-[hsl(35,40%,25%)]',
    social: 'dark:from-[hsl(180,35%,22%)] dark:to-[hsl(185,30%,28%)]',
    english: 'dark:from-[hsl(350,30%,28%)] dark:to-[hsl(340,25%,25%)]',
    history: 'dark:from-[hsl(280,30%,25%)] dark:to-[hsl(270,25%,30%)]',
    default: 'dark:from-[hsl(220,15%,18%)] dark:to-[hsl(220,12%,22%)]',
  };

  const shadowColors: Record<string, string> = {
    math: 'shadow-[0_8px_32px_-8px_hsla(220,60%,60%,0.25)] dark:shadow-[0_8px_32px_-8px_hsla(230,40%,15%,0.5)]',
    mathematics: 'shadow-[0_8px_32px_-8px_hsla(220,60%,60%,0.25)] dark:shadow-[0_8px_32px_-8px_hsla(230,40%,15%,0.5)]',
    science: 'shadow-[0_8px_32px_-8px_hsla(150,50%,50%,0.25)] dark:shadow-[0_8px_32px_-8px_hsla(150,30%,15%,0.5)]',
    economics: 'shadow-[0_8px_32px_-8px_hsla(35,70%,55%,0.25)] dark:shadow-[0_8px_32px_-8px_hsla(35,40%,15%,0.5)]',
    social: 'shadow-[0_8px_32px_-8px_hsla(180,50%,50%,0.25)] dark:shadow-[0_8px_32px_-8px_hsla(180,30%,15%,0.5)]',
    english: 'shadow-[0_8px_32px_-8px_hsla(340,60%,60%,0.25)] dark:shadow-[0_8px_32px_-8px_hsla(340,30%,15%,0.5)]',
    history: 'shadow-[0_8px_32px_-8px_hsla(270,50%,55%,0.25)] dark:shadow-[0_8px_32px_-8px_hsla(270,30%,15%,0.5)]',
    default: 'shadow-[0_8px_32px_-8px_hsla(220,20%,50%,0.2)] dark:shadow-[0_8px_32px_-8px_hsla(220,15%,10%,0.5)]',
  };

  const glowColors: Record<string, string> = {
    math: 'hover:shadow-[0_12px_40px_-6px_hsla(220,65%,60%,0.35)] dark:hover:shadow-[0_12px_40px_-6px_hsla(230,45%,30%,0.4)]',
    mathematics: 'hover:shadow-[0_12px_40px_-6px_hsla(220,65%,60%,0.35)] dark:hover:shadow-[0_12px_40px_-6px_hsla(230,45%,30%,0.4)]',
    science: 'hover:shadow-[0_12px_40px_-6px_hsla(150,55%,50%,0.35)] dark:hover:shadow-[0_12px_40px_-6px_hsla(150,35%,25%,0.4)]',
    economics: 'hover:shadow-[0_12px_40px_-6px_hsla(35,75%,55%,0.35)] dark:hover:shadow-[0_12px_40px_-6px_hsla(35,45%,25%,0.4)]',
    social: 'hover:shadow-[0_12px_40px_-6px_hsla(180,55%,50%,0.35)] dark:hover:shadow-[0_12px_40px_-6px_hsla(180,35%,25%,0.4)]',
    english: 'hover:shadow-[0_12px_40px_-6px_hsla(340,65%,60%,0.35)] dark:hover:shadow-[0_12px_40px_-6px_hsla(340,35%,25%,0.4)]',
    history: 'hover:shadow-[0_12px_40px_-6px_hsla(270,55%,55%,0.35)] dark:hover:shadow-[0_12px_40px_-6px_hsla(270,35%,25%,0.4)]',
    default: 'hover:shadow-[0_12px_40px_-6px_hsla(220,25%,50%,0.3)] dark:hover:shadow-[0_12px_40px_-6px_hsla(220,20%,20%,0.4)]',
  };

  const matchKey = Object.keys(lightGradients).find(key => name.includes(key)) || 'default';

  return {
    gradient: `${lightGradients[matchKey]} ${darkGradients[matchKey]}`,
    shadow: shadowColors[matchKey],
    glow: glowColors[matchKey],
  };
};
