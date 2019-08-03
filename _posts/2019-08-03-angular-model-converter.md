---
layout:     post
title:      Angular Model Converter
summary:    With a converter you can differentiate between what a user sees (view value) and what is actually persisted in the model (model value). This can be used for date/time input fields for instance where you want to display a string but want to save a JavaScript `Date` object.
categories: angular
---

{{page.summary}}

This is not a definitive solution. This is just the closest I came to what I’d call a conventional view/model converter.

If you know AngularJS, this is basically what `NgModelController`’s `$parsers` and `$formatters` would’ve done.

# Template-driven form

A conventional input field with a `cwtDateTimeInput` directive responsible for the conversion.

```html
<input type="text" id="appointment" name="appointment"
       placeholder="YYYY-MM-DD HH:mm"
       [(ngModel)]="newSchedule.appointment"
       cwtDateTimeInput>
```

# Directive

Start off with a directive the way you know it.

```typescript
@Directive({
    selector: '[cwtDateTimeInput][type=text]',
})
export class DateTimeInputDirective implements OnInit {
    ngOnInit(): void { }
}
```

## Inject the model reference

You can get hold of the `ngModel` instance simply by injecting it into your directive.

```typescript
constructor(private ngModel: NgModel, private elem: ElementRef<HTMLInputElement>) {
}
```

Via `NgModel` and its `control` field we can get access to the `FormControl` on which we’re going to perform most of the work.

The same works for injecting a reference to the input element.

## Listen to changes

In order to apply the conversion you need to know when to. This is always when the value of the input control changes. I say “value” because in Angular there normally doesn’t seem to be a difference between view and model value.

Using `FormControl.valueChanges` you can listen to any changes to the control’s value—programmatic as well as manual (UI) changes.

In your `ngOnInit` method:

```typescript
this.ngModel.control.valueChanges.subscribe(() => {
}
```
So, now you’re subscribed to all value changes to perform conversion at the right moment.

## Get the view value

The view value is what I consider the value the user can see in the control. Therefore it makes sense we have to access the DOM to retrieve it. We injected a reference to the DOM element earlier, let’s use it for this task:

```typescript
const viewValue = this.elem.nativeElement.value
```

This is how you get hold of the view value. This is yet to be converted to the model value.

**Remember: In this example we convert a string date and time representation to an actual JavaScript `Date` object.**

## Set the model value

The model value can be set without changing the view value using `FormControl.setValue` like

```typescript
this.ngModel.control.setValue(
        new Date(viewValue),
        {emitModelToViewChange: false, emitViewToModelChange: true, emitEvent: false});
```

Remember `viewValue` is the value of the DOM input field we retrieved earlier.

What I set for `emitModelToViewChange` and `emitViewToModelChange` just made sense for me semantically. 

It is important that you set `emitEvent` to `false`, though. Otherwise you’d create an infinite cycle because setting a new value would trigger your subscription to `valueChanges` again.

# Example

This have been the bits and pieces. Here is a full-fledged real world example. It encompasses sophisticated error handling and validation.

Since we’re essentially doing parsing work it makes sense that there can be a validation error regarding parsing. If you come from AngularJS this can be compared to what happens when a `$parser` returns `undefined` which also yields a `parse` validation error.

```typescript
import {Directive, ElementRef, OnInit} from '@angular/core';
import {NgModel} from "@angular/forms";

@Directive({
    selector: '[cwtDateTimeInput][type=text]',
})
export class DateTimeInputDirective implements OnInit {

    constructor(private ngModel: NgModel, private elem: ElementRef<HTMLInputElement>) {
    }

    ngOnInit(): void {
        this.ngModel.control.valueChanges.subscribe(() => {
            const val = this.elem.nativeElement.value;

            if (val == null || !val) return;

            const validationError = {'cwtDateTimeInput': true};
            const isoStr = val.replace(' ', 'T') + 'Z';
            const pattern = /^20[12][0-9]-[01][0-9]-[0-3][0-9]T[0-2][0-9]:[0-5][0-9]Z$/;

            if (!pattern.test(isoStr)) {
                this.ngModel.control.setErrors(validationError);
                return;
            }

            try {
                this.ngModel.control.setValue(
                    new Date(isoStr),
                    {emitModelToViewChange: false, emitViewToModelChange: true, emitEvent: false});
            } catch (_) {
                this.ngModel.control.setErrors(validationError);
            }
        });
    }
}
```

# Caveats

When you’re writing a validator, you’d also use `FormControl.value`. You’d get the view value representation and not the `Date` object. I found this to be counter-intuitive. I assume validations are run before the `valueChanges` emits.

When you submit the value to a backend or read it in a parent component or display it, it is a `Date` object as expected.

I will update this article as I learn on. 
