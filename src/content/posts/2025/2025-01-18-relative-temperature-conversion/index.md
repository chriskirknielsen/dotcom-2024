---
title: "Relative Temperature Conversion"
summary: "So this is how I can explain temperature fluctuations outside the US!"
time: '01:45:00'
tags:
    - personal
    - today-i-learned
---

As a European living in the US, besides the incoming four-year shitshow (or will it be longer?), I’ve been getting accustomed to things like units. (though I _still_ don’t know how many ounces are in a mile)

I’m comfortable converting between Celsius and Fahrenheit in my head: `F = 1.8×C + 32` (double it, remove one tenth, then add 32, done; in a pinch, `F ≈ 2×C + 30` is close) and `C = (F - 32) / 1.8` (which is granted a little tougher due to division, but you can get there using similar logic).

One thing that bugged me, however, is that I was never able to convert the difference of temperature like between 10°C and 20°C into Fahrenheit. So when I’d be talking to my family, I could see the temperature had gone down by 20°F looking at my weather app, but I’d have trouble expressing that in Celsius on the fly.

I had an epiphany while brushing my teeth (as you can tell, I think very interesting thoughts): it’s the same formula but without the constant!

10 to 20°C ↔ 50 to 68°F: A 10 degree difference in Celsius is an 18 degree difference in Fahrenheit, the `1.8×C` from before… it kinda blows my mind it’s that easy! Is this common knowledge? I feel like it’s dead simple but I’ve never come across that specific conversion scenario in all my years.

Because I am fun at parties, I made a lil’ converter that implements this newfound knowledge of mine (which… you could just calculate between the two inputs of the same unit, but where’s the fun in that?!):

{% codepen "https://codepen.io/chriskirknielsen/pen/PwYBzxN" %}

PS: You should definitely try to convert cold and hot temperatures… **no reason!**