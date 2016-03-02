read -p "Please enter the reason for commit: " REASON
BASEDIR=$(dirname "$0")
cd $BASEDIR
git add *
git commit -m "$REASON"