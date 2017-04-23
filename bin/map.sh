#!/bin/bash

# to run this, you'll need imagemagick:
# brew install imagemagick

size=272
ox=7
oy=4

convert -size 3808x3808 canvas:black map.png
for ((x=0; x < 14; x++)); do
    for ((y=0; y < 14; y++)); do
        name=`printf "%02x%02x" $x $y`
        px=`echo "$x*$size" | bc`
        py=`echo "$y*$size" | bc`
        echo "name=$name pos=$px,$py"
        `convert assets/world/$name.png -crop ${size}x${size}+${ox}+${oy} out.png`
        `composite -geometry +$px+$py out.png map.png map.png`
    done
done
