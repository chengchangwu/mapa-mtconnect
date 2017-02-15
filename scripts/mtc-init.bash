#! /bin/bash
# MTCconnect script.

# Startup MTConnect Agent.
agent debug /home/debian/mapa-mtconnect/agent/agent.cfg

# Startup Botnana-A2 Adapter.
node /home/debian/mapa-mtconnect/adapter/mtcAdapter.js
