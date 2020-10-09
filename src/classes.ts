import { Instance, InstanceConstructor } from './instances'
import { Left, Right } from './utils'
import { all, obey, ValidationResult, Validator } from './validators'

type Laws = Validator<Instance>

export interface ClassOptions {
  /** The name will be used to improve error messages. */
  name?: string
  /** A list of classes that are prerequisites to this one. */
  extends?: Class[]
  /** A validator that will check if a constructor is an instance of this class. */
  laws?: Laws
}

/**
 * A class defines the behavior that your instances shall have.
 *
 * The behavior will be asserted using the given laws (if a given constructor is declared
 * to be an instance of a given class, but it does not pass its validations, an error is
 * thrown).
 *
 * A class may also extend other classes, so all their validators must pass as well.
 *
 * @example
 * ```javascript
 * const monoid = new Class({
 *  name: 'Monoid',
 *  extends: [eq],
 *  laws: all(append, commutativity, associativity, identity)
 * })
 * ```
 *
 * @see {@link all}
 */
export class Class {
  public readonly parents: Class[]
  public readonly laws: Laws
  public readonly name: string

  constructor(options: ClassOptions) {
    const { extends: parents = [], laws = all(), name } = options

    this.parents = parents
    this.laws = laws
    this.name = name || 'Unnamed'
  }

  validate(instance: InstanceConstructor): ValidationResult {
    const parentLefts = this.parents
      .map((parent) => parent.validate(instance))
      .filter((result) => result instanceof Left)

    if (parentLefts.length) {
      return new Left(
        `Class ${instance.name} fails the prerequisites to be a ${
          this.name
        }\n\n${parentLefts.map((left) => left.value).join('\n\n')}`,
      )
    }

    return this.laws.check(instance)
  }
}
