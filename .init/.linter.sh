#!/bin/bash
cd /home/kavia/workspace/code-generation/graph-visualization-software-7354-8699/WebApplicationContainer
npm run build
EXIT_CODE=$?
if [ $EXIT_CODE -ne 0 ]; then
   exit 1
fi

