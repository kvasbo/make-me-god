#! /bin/bash

# start timer
T="$(date +%s)"

cd /var/www/html/workfiles
echo "s/god/"$1"/ig" > $1.sed
sed -f $1.sed /var/www/html/templates/base.tex.base > base.$1.tex
sed 's/base/base.'$1'/g' /var/www/html/templates/bible.tex.base > bible.$1.tex

pdflatex -jobname=$1 bible.$1.tex > latexoutput.txt

mv $1.pdf /var/www/html/bibles/$1.pdf

rm /var/www/html/workfiles/$1.aux
rm /var/www/html/workfiles/$1.log
rm /var/www/html/workfiles/$1.sed
rm /var/www/html/workfiles/bible.$1.tex
rm /var/www/html/workfiles/base.$1.tex
rm /var/www/html/workfiles/latexoutput.txt

T="$(($(date +%s)-T))"

echo "Bible created: "$1" Time spent: "$T
