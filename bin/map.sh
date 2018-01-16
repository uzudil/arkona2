#!/bin/bash

# to run this, you'll need imagemagick:
# brew install imagemagick

size=384
ox=0
oy=3

minx=0
miny=0
maxx=21
maxy=21

w=`echo "$maxx*$size" | bc`
h=`echo "$maxy*$size" | bc`
sx=`echo "($w-$size)/2" | bc`

if [ -z map.png ]; then
    echo "image size=$w x $h"
    convert -size ${w}x${h} canvas:black map.png
fi

for ((x=$minx; x < $maxx; x++)); do
    for ((y=$miny; y < $maxy; y++)); do
        name=`printf "%02x%02x" $x $y`
        px=`echo "$sx+(($x-$y)*$size)/2" | bc`
        py=`echo "(($x+$y)*$size)/2" | bc`
        echo "name=$name pos=$px,$py"
        `convert assets/world/$name.png -transparent black -crop ${size}x${size}+${ox}+${oy} out.png`
        `composite -geometry +$px+$py out.png map.png map.png`
    done
done
