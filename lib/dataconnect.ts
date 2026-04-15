import { getDataConnect } from "firebase-admin/data-connect";
import { getFirebaseAdminApp } from "@/lib/firebase-admin";

const connectorConfig = {
  connector: "example",
  serviceId: "student-management-system",
  location: "us-west4",
};

export function getAdminDataConnect() {
  return getDataConnect(connectorConfig, getFirebaseAdminApp());
}
