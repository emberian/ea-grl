import { useAtomValue, useSetAtom } from "jotai";

import { Button } from "../../../atoms/button/Button";
import { useHydrogen } from "../../../hooks/useHydrogen";
import { useRoomsOfType, RoomTypes } from "../../../hooks/useRoomsOfType";
import { EmptyState } from "../../components/empty-state/EmptyState";
import { DmDialog } from "../dialogs/DmDialog";
import { Dialog } from "../../../atoms/dialog/Dialog";
import { RoomSelector } from "./selector/RoomSelector";
import { useDialog } from "../../../hooks/useDialog";
import { activeChatsAtom, openedChatAtom } from "../../../state/overlayChat";

export function RoomListFriends() {
  const { session, platform } = useHydrogen(true);

  const [rooms] = useRoomsOfType(session, RoomTypes.Direct);
  const { open, setOpen, openDialog, closeDialog } = useDialog(false);
  const openedChatId = useAtomValue(openedChatAtom);
  const setActiveChat = useSetAtom(activeChatsAtom);

  if (rooms.length === 0) {
    return (
      <EmptyState
        style={{ minHeight: "400px" }}
        heading="No Friends"
        text="You don't have any friends yet."
        actions={
          <>
            <Dialog open={open} onOpenChange={setOpen}>
              <DmDialog requestClose={closeDialog} />
            </Dialog>
            <Button onClick={openDialog}>Direct Message</Button>
          </>
        }
      />
    );
  }

  return (
    <div>
      {rooms.map((room) => (
        <RoomSelector
          key={room.id}
          isSelected={room.id === openedChatId}
          onSelect={(roomId) => setActiveChat({ type: "OPEN", roomId })}
          room={room}
          platform={platform}
        />
      ))}
    </div>
  );
}
