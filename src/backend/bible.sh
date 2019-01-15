#! /bin/bash

# start timer
T="$(date +%s)"

FILE=./bibles/$1.pdf

if [ -f $FILE ]; then
   echo "File $FILE does exist."
   exit 1
fi

# Get to the right folder
cd workfiles

# Create job
echo "s/tullegud/"$1"/ig" > $1.sed
sed -f $1.sed ../templates/base.tex.base > base.$1.tex
sed 's/base/base.'$1'/g' ../templates/bible.tex.base > bible.$1.tex

# Create and move file
pdflatex -jobname=$1 bible.$1.tex > latexoutput.txt
mv $1.pdf ../bibles/$1.pdf
chmod 755 ../bibles/$1.pdf

# Cleanup
rm $1.aux
rm $1.log
rm $1.sed
rm bible.$1.tex
rm base.$1.tex
rm latexoutput.txt

T="$(($(date +%s)-T))"

echo "Bible created: "$1" Time spent: "$T
