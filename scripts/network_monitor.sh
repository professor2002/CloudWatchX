#!/bin/bash

TIMESTAMP=$(date '+%Y-%m-%d %H:%M:%S')

INTERFACE="eth0"

RX_BYTES=$(cat /sys/class/net/$INTERFACE/statistics/rx_bytes)
TX_BYTES=$(cat /sys/class/net/$INTERFACE/statistics/tx_bytes)

RX_PACKETS=$(cat /sys/class/net/$INTERFACE/statistics/rx_packets)
TX_PACKETS=$(cat /sys/class/net/$INTERFACE/statistics/tx_packets)

MESSAGE="[$TIMESTAMP] Interface: $INTERFACE | RX: ${RX_BYTES} bytes (${RX_PACKETS} packets) | TX: ${TX_BYTES} bytes (${TX_PACKETS} packets)"

echo "$MESSAGE"
echo "$MESSAGE" >> logs/network.log
