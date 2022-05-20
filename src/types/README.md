Example:

```ts
/**
 * `/SomeResource`
 *
 * SomeResource related resources.
 */
export namespace SomeResource {
  /**
   * `GET /SomeResource`
   *
   * Information on all GET resources.
   */
  export namespace Get {
    /**
     * `GET /SomeResource`
     *
     * Information on the static GET resource.
     */
    export type _ = {};

    /**
     * `GET /SomeResource/Foo`
     *
     * Information on the Foo GET resource.
     */
    export type Foo = {};

    /**
     * `GET /SomeResource/Bar/`
     *
     * Bar related resources
     */
    export namespace Bar {
      /**
       * `GET /SomeResource/Bar/`
       *
       * Information on the Bar GET resource.
       */
      export type _ = {};

      /**
       * `GET /SomeResource/Bar/:Param`
       *
       * Information on the dynamic Bar GET resource.
       */
      export type Param = {};
    }
  }
}
```

> Types are organized via API resources with their following HTTP method. Types
> that require more than one HTTP method are grouped under a namespace with the
> action, following the method. Example:

> ```
> Deployment.Post.Request
> Deployment.Post.Response
> Deployment.Get
> ```

> This is to help with the readability of what is being interacted with the API.
> Something as silly as mixing a GET request with a POST response can be very
> easy to misunderstand.

> Namespace resources on base paths require a `_` type.

> ```
> /user
> User._
>
> /guilds
> Guilds._
> ```

this is in revision
