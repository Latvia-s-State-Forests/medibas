import * as React from "react";
import { IconButton } from "./icon-button";

type ShareButtonProps = {
    onPress: () => void;
};

export function ShareButton(props: ShareButtonProps) {
    return <IconButton name="share" color="green" onPress={props.onPress} />;
}
