#!/usr/bin/env bash
set -e 

OUT_DIR=generated
CURRENT_DIR=$(pwd)
OUT_DIR=$CURRENT_DIR/generated
COMPOSEDB_CMD="sh composedb"

cd $1

source composedb.env

create_model () {
  echo "Creating composite from "$1" as "$2
  local input_file=$1
  local output_file=$2
  $COMPOSEDB_CMD composite:create --output $output_file $input_file 2>&1 > /dev/null
  local stream_id=$(cat $output_file | jq '.models | keys_unsorted[0]')
  retval=$stream_id
}

create_model $CURRENT_DIR/schemas/finetuning.graphql $OUT_DIR/finetuning.json
export FINETUNING_ID=$retval
create_model $CURRENT_DIR/schemas/ai_model.graphql $OUT_DIR/ai_model.json
export AIMODEL_ID=$retval

finetuning_relation_sub=$OUT_DIR/sub_finetuning_relation.graphql
envsubst < $CURRENT_DIR/schemas/finetuning_relation.graphql > $finetuning_relation_sub
create_model $finetuning_relation_sub $OUT_DIR/finetuning_relation.json
export FINETUNING_RELATION_ID=$retval

ai_relation_sub=$OUT_DIR/sub_ai_model_relation.graphql
cat $CURRENT_DIR/schemas/ai_model_relation.graphql | envsubst > $ai_relation_sub
create_model $ai_relation_sub $OUT_DIR/ai_relation.json
export AI_MODEL_RELATION_ID=$retval

$COMPOSEDB_CMD composite:merge $OUT_DIR/finetuning.json $OUT_DIR/ai_model.json $OUT_DIR/finetuning_relation.json $OUT_DIR/ai_relation.json --output=$OUT_DIR/merged.json
$COMPOSEDB_CMD composite:deploy $OUT_DIR/merged.json
$COMPOSEDB_CMD composite:compile $OUT_DIR/merged.json $OUT_DIR/runtime.json

cd $CURRENT_DIR




