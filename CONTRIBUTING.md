THANKS FOR CONTRIBUTING
-----------------------

Issue reports and pull requests are always welcome!

## Code Style

- Use Tab for indentation
- Limit lines to 100 columns


### Return Early

-   BAD

``` sourceCode
function foo() {
  if (x) {
    ...
  }
}
```

-   GOOD

``` sourceCode
function foo() {
  if (!x) {
    return;
  }

  ...
}
```

Keeps indentation levels down and makes more readable.
