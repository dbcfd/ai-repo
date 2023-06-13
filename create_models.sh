#!/usr/bin/env bash

OUT_DIR=generated

create_model () {
  echo "Creating composite from "$1" as "$2
  local input_file=$1
  local output_file=$2
  composedb composite:create --output $output_file $input_file 2>&1 > /dev/null
  local stream_id=$(cat $output_file | jq '.models | keys_unsorted[0]')
  retval=$stream_id
}

create_model "schemas/finetuning.graphql" "$OUT_DIR/finetuning.json"
export FINETUNING_ID=$retval
create_model "schemas/ai_model.graphql" $OUT_DIR"/ai_model.json"
export AIMODEL_ID=$retval

finetuning_relation_sub=$OUT_DIR"/sub_finetuning_relation.graphql"
envsubst < schemas/finetuning_relation.graphql > $finetuning_relation_sub
create_model $finetuning_relation_sub $OUT_DIR"/finetuning_relation.json"
export FINETUNING_RELATION_ID=$retval

ai_relation_sub=$OUT_DIR"/sub_ai_model_relation.graphql"
cat schemas/ai_model_relation.graphql | envsubst > $ai_relation_sub
create_model $ai_relation_sub $OUT_DIR"/ai_relation.json"
export AI_MODEL_RELATION_ID=$retval

composedb composite:merge $OUT_DIR/finetuning.json $OUT_DIR/ai_model.json $OUT_DIR/finetuning_relation.json $OUT_DIR/ai_relation.json --output=$OUT_DIR/merged.json
composedb composite:deploy $OUT_DIR/merged.json
composedb composite:compile $OUT_DIR/merged.json $OUT_DIR/runtime.json




