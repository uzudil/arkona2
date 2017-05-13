#!/bin/bash

# to run this, you'll need imagemagick:
# brew install imagemagick

size=272
ox=7
oy=4

minx=4
miny=0
maxx=11
maxy=6

w=`echo "$maxx*$size" | bc`
h=`echo "$maxy*$size" | bc`

if [ -z map.png ]; then
    echo "image size=$w x $h"
    convert -size ${w}x${h} canvas:black map.png
fi

for ((x=$minx; x < $maxx; x++)); do
    for ((y=$miny; y < $maxy; y++)); do
        name=`printf "%02x%02x" $x $y`
        px=`echo "$x*$size" | bc`
        py=`echo "$y*$size" | bc`
        echo "name=$name pos=$px,$py"
        `convert assets/world/$name.png -crop ${size}x${size}+${ox}+${oy} out.png`
        `composite -geometry +$px+$py out.png map.png map.png`
    done
done
