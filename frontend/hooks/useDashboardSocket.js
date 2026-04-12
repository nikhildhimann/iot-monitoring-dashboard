"use client";

import { useEffect, useRef } from "react";

import { connectSocket, disconnectSocket } from "@/lib/socket/client";

const SOCKET_EVENTS = {
  CONNECT: "connect",
  READING_UPDATE: "reading:update",
  DEVICE_UPDATE: "device:update",
  ALERT_NEW: "alert:new",
  ALERT_UPDATE: "alert:update",
  SUBSCRIBE_DEVICE: "device:subscribe",
  UNSUBSCRIBE_DEVICE: "device:unsubscribe",
};

export function useDashboardSocket({
  enabled,
  selectedDeviceId,
  onReadingUpdate,
  onDeviceUpdate,
  onAlertNew,
  onAlertUpdate,
  onReconnectRecovery,
}) {
  const selectedDeviceIdRef = useRef(selectedDeviceId);
  const onReadingUpdateRef = useRef(onReadingUpdate);
  const onDeviceUpdateRef = useRef(onDeviceUpdate);
  const onAlertNewRef = useRef(onAlertNew);
  const onAlertUpdateRef = useRef(onAlertUpdate);
  const onReconnectRecoveryRef = useRef(onReconnectRecovery);
  const hasConnectedRef = useRef(false);
  const previousDeviceIdRef = useRef("");

  useEffect(() => {
    selectedDeviceIdRef.current = selectedDeviceId;
    onReadingUpdateRef.current = onReadingUpdate;
    onDeviceUpdateRef.current = onDeviceUpdate;
    onAlertNewRef.current = onAlertNew;
    onAlertUpdateRef.current = onAlertUpdate;
    onReconnectRecoveryRef.current = onReconnectRecovery;
  }, [
    selectedDeviceId,
    onReadingUpdate,
    onDeviceUpdate,
    onAlertNew,
    onAlertUpdate,
    onReconnectRecovery,
  ]);

  useEffect(() => {
    if (!enabled) {
      return undefined;
    }

    const socket = connectSocket();

    const handleConnect = () => {
      const activeDeviceId = selectedDeviceIdRef.current;

      if (activeDeviceId) {
        socket.emit(SOCKET_EVENTS.SUBSCRIBE_DEVICE, activeDeviceId);
      }

      if (hasConnectedRef.current && onReconnectRecoveryRef.current) {
        onReconnectRecoveryRef.current(activeDeviceId);
      }

      hasConnectedRef.current = true;
    };

    const handleReadingUpdate = (payload) => {
      onReadingUpdateRef.current?.(payload);
    };

    const handleDeviceUpdate = (payload) => {
      onDeviceUpdateRef.current?.(payload);
    };

    const handleAlertNew = (payload) => {
      onAlertNewRef.current?.(payload);
    };

    const handleAlertUpdate = (payload) => {
      onAlertUpdateRef.current?.(payload);
    };

    socket.on(SOCKET_EVENTS.CONNECT, handleConnect);
    socket.on(SOCKET_EVENTS.READING_UPDATE, handleReadingUpdate);
    socket.on(SOCKET_EVENTS.DEVICE_UPDATE, handleDeviceUpdate);
    socket.on(SOCKET_EVENTS.ALERT_NEW, handleAlertNew);
    socket.on(SOCKET_EVENTS.ALERT_UPDATE, handleAlertUpdate);

    return () => {
      const activeDeviceId = selectedDeviceIdRef.current;

      if (activeDeviceId) {
        socket.emit(SOCKET_EVENTS.UNSUBSCRIBE_DEVICE, activeDeviceId);
      }

      socket.off(SOCKET_EVENTS.CONNECT, handleConnect);
      socket.off(SOCKET_EVENTS.READING_UPDATE, handleReadingUpdate);
      socket.off(SOCKET_EVENTS.DEVICE_UPDATE, handleDeviceUpdate);
      socket.off(SOCKET_EVENTS.ALERT_NEW, handleAlertNew);
      socket.off(SOCKET_EVENTS.ALERT_UPDATE, handleAlertUpdate);
      hasConnectedRef.current = false;
      previousDeviceIdRef.current = "";
      disconnectSocket();
    };
  }, [enabled]);

  useEffect(() => {
    if (!enabled) {
      return;
    }

    const socket = connectSocket();
    const previousDeviceId = previousDeviceIdRef.current;

    if (previousDeviceId && previousDeviceId !== selectedDeviceId) {
      socket.emit(SOCKET_EVENTS.UNSUBSCRIBE_DEVICE, previousDeviceId);
    }

    if (selectedDeviceId) {
      socket.emit(SOCKET_EVENTS.SUBSCRIBE_DEVICE, selectedDeviceId);
    }

    previousDeviceIdRef.current = selectedDeviceId || "";
  }, [enabled, selectedDeviceId]);
}
