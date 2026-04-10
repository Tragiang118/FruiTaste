import { Field, FieldDescription, FieldLabel } from "~/components/ui/field"
import { Input } from "~/components/ui/input"

const Example = () => (
  <div className="w-full max-w-md">
    <Field>
      <FieldLabel htmlFor="password">Password</FieldLabel>
      <FieldDescription>Must be at least 8 characters long.</FieldDescription>
      <Input className="bg-background" id="password" placeholder="********" type="password" />
    </Field>
  </div>
)

export default Example
