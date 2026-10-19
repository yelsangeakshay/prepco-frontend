import type { Meta, StoryObj } from "@storybook/react";
import { useState } from "react";
import { Button } from "./button";
import { Badge } from "./badge";
import { Card } from "./card";
import { Input, Label, Textarea, FieldError } from "./field";
import { Switch } from "./switch";

const meta: Meta = { title: "UI/Primitives" };
export default meta;
type S = StoryObj;

export const Buttons: S = {
  render: () => (
    <div className="flex flex-wrap gap-3 p-6">
      <Button>Primary</Button>
      <Button variant="secondary">Secondary</Button>
      <Button variant="ghost">Ghost</Button>
      <Button variant="gold">Gold</Button>
      <Button disabled>Disabled</Button>
      <div className="bg-navy-900 rounded-xl p-3">
        <Button variant="onNavy">On Navy</Button>
      </div>
    </div>
  ),
};

export const Badges: S = {
  render: () => (
    <div className="flex flex-wrap gap-2 p-6">
      {(["neutral", "green", "maroon", "maroonSoft", "gold", "navy", "outline"] as const).map(
        (t) => (
          <Badge key={t} tone={t}>
            {t}
          </Badge>
        ),
      )}
    </div>
  ),
};

export const Cards: S = {
  render: () => (
    <div className="grid gap-4 p-6 md:grid-cols-4">
      <Card>Default</Card>
      <Card variant="feature">Feature</Card>
      <Card variant="navy">Navy</Card>
      <Card variant="inset">Inset</Card>
    </div>
  ),
};

export const Fields: S = {
  render: () => (
    <div className="max-w-sm space-y-4 p-6">
      <div>
        <Label htmlFor="a">Email</Label>
        <Input id="a" placeholder="riya@example.com" />
      </div>
      <div>
        <Label htmlFor="b">Invalid</Label>
        <Input id="b" aria-invalid defaultValue="nope" />
        <FieldError>Enter a valid email</FieldError>
      </div>
      <div>
        <Label htmlFor="c">Note</Label>
        <Textarea id="c" />
      </div>
    </div>
  ),
};

function SwitchDemo() {
  const [on, setOn] = useState(false);
  return (
    <div className="p-6">
      <Switch label="Send back to builder" checked={on} onCheckedChange={setOn} />
    </div>
  );
}
export const Switches: S = { render: () => <SwitchDemo /> };
