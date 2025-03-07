export type Color = keyof (typeof theme)["color"];
export type FontFamily = keyof (typeof theme)["fontFamily"];
export type FontSize = keyof (typeof theme)["fontSize"];

export const theme = {
    color: {
        background: "#f2f1ed",
        white: "#FFFFFF",
        green: "#606c38",
        greenActive: "#77844f",
        greenPressed: "#465322",
        orange: "#fe5d26",
        orangeActive: "#ff7a3b",
        orangePressed: "#de3e12",
        sand: "#f2efd5",
        sandActive: "#fefae0",
        sandPressed: "#e6e3ca",
        teal: "#00b9ae",
        tealActive: "#3ed6ca",
        tealPressed: "#009e94",
        success: "#0cce6b",
        error: "#ed254e",
        warning: "#edd83d",
        information: "#20A4F3",
        gray1: "#f3f4f6",
        gray2: "#dcddde",
        gray3: "#c6c6c8",
        gray4: "#a5a6a7",
        gray5: "#818183",
        gray6: "#5e5e60",
        gray7: "#3d3e3f",
        gray8: "#1f2021",
        gray9: "#0e0e0e",
        grayTransparent: "#0e0e0e90",
        transparent: "transparent",
    },
    fontFamily: {
        regular: "IBMPlexSans_400Regular",
        bold: "IBMPlexSans_700Bold",
    },
    fontSize: {
        10: 10,
        12: 12,
        14: 14,
        16: 16,
        18: 18,
        20: 20,
        22: 22,
    },
};
