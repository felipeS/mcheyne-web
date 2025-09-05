"use client";
import { Text } from "@radix-ui/themes";
import { forwardRef } from "react";

type LabelProps = React.ComponentPropsWithoutRef<typeof Text> & {
  htmlFor?: string;
};

const Label = forwardRef<HTMLLabelElement, LabelProps>((props, ref) => (
  <Text as="label" {...props} ref={ref} />
));

Label.displayName = "Label";

export { Label };
