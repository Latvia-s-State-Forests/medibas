import { formatPosition } from "~/utils/format-position";

describe("formatPosition", () => {
    it("should format position", () => {
        const result = formatPosition({ latitude: 56.91867, longitude: 24.09172, accuracy: 10 });
        expect(result).toBe("56.91867, 24.09172 (± 10 m)");
    });

    it("should only show the first five digits after the decimal point", () => {
        const result = formatPosition({ latitude: 56.9186677, longitude: 24.0917236, accuracy: 10 });
        expect(result).toBe("56.91867, 24.09172 (± 10 m)");
    });

    it("should round accuracy", () => {
        const result = formatPosition({ latitude: 56.91867, longitude: 24.09172, accuracy: 10.5 });
        expect(result).toBe("56.91867, 24.09172 (± 11 m)");
    });

    it("should not show accuracy if it is zero", () => {
        const result = formatPosition({ latitude: 56.91867, longitude: 24.09172, accuracy: 0 });
        expect(result).toBe("56.91867, 24.09172");
    });

    it("should not show accuracy if it is undefined", () => {
        const result = formatPosition({ latitude: 56.91867, longitude: 24.09172 });
        expect(result).toBe("56.91867, 24.09172");
    });
});
