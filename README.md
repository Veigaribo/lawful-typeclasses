# Lawful Type Classes

`lawful-typeclasses` is a library designed to provide a way of asserting
the behavior of your JS classes.

"Lawful" here refers to a characteristic of [principled type classes](https://degoes.net/articles/principled-typeclasses).

## What it does

This library allows you to define two things: classes and instances. Perhaps
a bit confusedly, classes are JS objects and instances are JS classes.

### Classes

A class is what defines the behavior that you want your other classes to
conform to.

For example, let's say that you want to define a class of things that can be
added:

```javascript
// our class is going to be an instance of Class
const addable = new Class({
  // this is what I've decided to name my class
  // this option is not necessary, but it helps in case something goes
  // wrong
  name: 'Addable',
  // next, we define the properties we expect our instances to have
  // we'll start out by using the `all` function to say that, in order to
  // be an Addable, the class must obey all of the following laws (not any)
  laws: all(
    obey((x, y) => {
      // we expect addition to be commutative
      const a = x.add(y)
      const b = y.add(x)

      return a.equals(b)
    }),
    obey((x, y, z) => {
      // we expect addition to be associative
      const a = x.add(y.add(z))
      const b = x.add(y).add(z)

      return a.equals(b)
    }),
  ),
})
```

But, as you might have seen, we also expect our instances to implement an `#equals` method.

This could be another class:

```javascript
const eq = new Class({
  name: 'Eq',
  laws: all(
    obey((x) => {
      // we expect comparison to oneself to be true
      return x.equals(x)
    }),
  ),
})
```

And then the Addable class may _extend_ Eq, meaning that, in order to be an
instance of Addable, the class must also be an instance of Eq:

```javascript
const addable = new Class({
  name: 'Addable',
  extends: [eq],
  laws: ...
})
```

### Instances

Instances are JS classes that behave according to some (type) class.

Using the Addable example above, one could almost define an instance as:

```javascript
@instance(addable)
class Number {
  constructor(n) {
    this.n = n
  }

  equals(other) {
    return this.n === other.n
  }

  add(other) {
    return new Number(this.n + other.n)
  }
}
```

The only extra step is to define a static method called `generateData`, that
will take any number of random numbers as parameters and should return a
random JS instance of the JS class.

```javascript
@instance(addable)
class Number {
  ...

  static generateData(n) {
    // this is quite a trivial example, we just wrap the n
    return new Number(n)
  }
}
```

## How it works

When you define your JS class using the `@instance` decorator, a sample of
random JS instances of your JS class will be generated using your JS classes'
`generateData`, and each property will be tested using those. If any of the
laws fails to be asserted, an error is thrown, and you may be sure that the
JS class in question is not an instance of the class you declared in the
decorator.

In case it passes, you may have a high confidence that it is.

## What if I can't use decorators?

An approach would be to use the `instance(...)` decorator as a regular
function:

```javascript
class Number {
  ...
}

// will throw if anything goes bad
instance(addable)(Number)
```
