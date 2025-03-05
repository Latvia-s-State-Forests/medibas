import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { Buffer } from "buffer";
import { useTranslation } from "react-i18next";
import { Dimensions, StyleSheet, View } from "react-native";
import QRCode from "react-native-qrcode-svg";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useDarkStatusBar } from "~/hooks/use-status-bar";
import { theme } from "~/theme";
import { RootNavigatorParams } from "~/types/navigation";
import { Button } from "../button";
import { Spacer } from "../spacer";
import { Text } from "../text";

type QRPreviewModalProps = NativeStackScreenProps<RootNavigatorParams, "QRPreviewModal">;

export function QRPreviewModal({ navigation, route }: QRPreviewModalProps) {
    const { title, description, value } = route.params;
    const encodedValue = Buffer.from(value).toString("base64");
    const { width } = Dimensions.get("window");
    const qrSize = width * 0.65;
    const { t } = useTranslation();
    const insets = useSafeAreaInsets();
    useDarkStatusBar();

    return (
        <View
            style={[
                styles.container,
                {
                    paddingRight: insets.right + 16,
                    paddingLeft: insets.left + 16,
                    paddingBottom: insets.bottom + 24,
                    paddingTop: insets.top,
                },
            ]}
        >
            <View style={styles.outsideContainer}>
                <View style={{ width: qrSize }}>
                    <Text style={styles.title} size={22} weight="bold">
                        {title}
                    </Text>
                    <Spacer size={12} />
                    {description ? <Text style={styles.description}>{description}</Text> : null}
                    <Spacer size={24} />
                    <QRCode backgroundColor={theme.color.background} size={qrSize} value={encodedValue} />
                </View>
            </View>
            <Button
                title={t("modal.close")}
                onPress={() => {
                    navigation.goBack();
                }}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: theme.color.background,
    },
    outsideContainer: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
    },
    title: {
        textAlign: "center",
    },
    description: {
        textAlign: "center",
    },
});
