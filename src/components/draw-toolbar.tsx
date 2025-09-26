import * as React from "react";
import { Platform, StyleSheet, View } from "react-native";
import { theme } from "~/theme";
import { DrawToolbarButton } from "./draw-toolbar-button";

type DrawToolbarProps = {
    onLineDraw: () => void;
    onPolygonDraw: () => void;
    onFinishDrawing: () => void;
    hasMultiplePoints: boolean;
    hasFirstPoint?: boolean;
    shapeDrawn: boolean;
    onDeleteLine: () => void;
    onDeletePolygon: () => void;
    onSave: () => void;
    showAdditionalTools: boolean;
    setShowAdditionalTools: (show: boolean) => void;
};

export function DrawToolbar({
    onLineDraw,
    shapeDrawn,
    onDeleteLine,
    onDeletePolygon,
    onSave,
    onPolygonDraw,
    showAdditionalTools = false,
    setShowAdditionalTools,
    onFinishDrawing,
    hasMultiplePoints = false,
    hasFirstPoint = false,
}: DrawToolbarProps) {
    const [selected, setSelected] = React.useState<"line" | "polygon" | "trash" | "save">("line");
    const [isFinishing, setIsFinishing] = React.useState(false);

    function onLinePress() {
        // Toggle off if already selected
        if (showAdditionalTools && selected === "line") {
            setShowAdditionalTools(false);
            onDeleteLine();
        } else {
            onDeleteLine();
            setIsFinishing(false);
            setShowAdditionalTools(true);
            setSelected("line");
            onLineDraw();
        }
    }

    function onFinishPress() {
        onFinishDrawing();
    }

    function onPolygonPress() {
        onDeletePolygon();
        setSelected("polygon");
        setIsFinishing(false);
        onPolygonDraw();
    }

    function onTrashPress() {
        setSelected("trash");
        onDeleteLine();
        onDeletePolygon();
        setShowAdditionalTools(false);
    }

    function onSavePress() {
        onSave();
    }

    return (
        <View style={styles.container}>
            {showAdditionalTools && (
                <View>
                    {shapeDrawn && (
                        <>
                            <DrawToolbarButton
                                name="save"
                                onPress={onSavePress}
                                selected={selected === "save" && showAdditionalTools}
                            />
                            <DrawToolbarButton
                                name="trash"
                                onPress={onTrashPress}
                                selected={selected === "trash" && showAdditionalTools}
                            />
                        </>
                    )}
                    {hasMultiplePoints && !shapeDrawn && (
                        <DrawToolbarButton
                            name="check"
                            onPress={onFinishPress}
                            selected={isFinishing && showAdditionalTools}
                        />
                    )}
                    {(hasMultiplePoints || hasFirstPoint) && !shapeDrawn && (
                        <DrawToolbarButton
                            name="trash"
                            onPress={onTrashPress}
                            selected={selected === "trash" && showAdditionalTools}
                        />
                    )}
                    <DrawToolbarButton
                        name="polygon"
                        onPress={onPolygonPress}
                        selected={selected === "polygon" && showAdditionalTools}
                    />
                </View>
            )}
            <DrawToolbarButton
                name="line"
                onPress={onLinePress}
                selected={selected === "line" && showAdditionalTools}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        borderRadius: 8,
        borderWidth: 1,
        borderColor: theme.color.gray2,
        backgroundColor: theme.color.white,
        shadowColor: theme.color.gray8,
        ...Platform.select({
            ios: {
                shadowOffset: { width: 0, height: 4 },
                shadowColor: theme.color.gray8,
                shadowRadius: 8,
                shadowOpacity: 0.16,
            },
            android: {
                elevation: 7,
            },
        }),
    },
});
