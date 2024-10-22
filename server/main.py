import asyncio
from fastapi import FastAPI, WebSocket, Query
from scapy.all import sniff, get_if_list, TCP, IP, UDP
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3001", "http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

protocol_mapping = {
    '6': 'TCP',
    '17': 'UDP'
}

class Sniffer:
    def __init__(self, interface: str, filter_:str = ""):
        self.interface = interface
        self.filter_ = filter_
        self.is_websocket_closed = False

    async def _handle_packet_and_send(self, packet, websocket: WebSocket):
        if IP in packet and not self.is_websocket_closed:
            if TCP or UDP in packet:
                packet_data = {
                    'src': packet[IP].src,
                    'dst': packet[IP].dst,
                    'src_port': packet[TCP if packet.haslayer(TCP) else UDP if packet.haslayer(UDP) else None].sport,
                    'dst_port': packet[TCP if packet.haslayer(TCP) else UDP if packet.haslayer(UDP) else None].dport,
                    'protocol': protocol_mapping.get(str(packet.proto), 'Unknown'),
                }
                try:
                    await websocket.send_json(packet_data)
                except Exception as e:
                    print(f"Error sending packet: {e}")
                    self.is_websocket_closed = True

    def _handle_packet(self, packet, websocket: WebSocket):
        asyncio.run(self._handle_packet_and_send(packet, websocket))

    def stream_sniff(self, websocket: WebSocket):
        print(f"{self.interface}: sniffing...")
        sniff(iface=self.interface, filter=self.filter_, prn=lambda pkt: self._handle_packet(pkt, websocket), store=0)


@app.get("/layers")
def get_interfaces():
    return get_if_list()


@app.websocket("/ws/{interface}")
async def websocket_endpoint(interface: str, websocket: WebSocket, filter: str=''):
    await websocket.accept()
    sniffer = Sniffer(interface, filter)

    try:
        # Start sniffing in a separate thread
        await asyncio.to_thread(sniffer.stream_sniff, websocket)
    except Exception as e:
        print(f"Error: {e}")
    finally:
        await websocket.close()
