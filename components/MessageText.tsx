/**
 * 말풍선 본문. *별표로 감싼 부분*은 대사가 아니라 행동/상황 묘사(지문)이므로
 * 기울임체 + 흐린 색으로 구분해 보여준다. 별표 기호 자체는 숨긴다.
 */
export default function MessageText({
  text,
  actionClassName,
}: {
  text: string;
  /** 지문에 입힐 색상 클래스 (말풍선 배경에 따라 다르게) */
  actionClassName: string;
}) {
  // 홀수 번째 조각이 별표 안쪽. 짝이 안 맞는 별표는 그대로 글자로 남는다.
  const parts = text.split(/\*([^*\n]+)\*/g);
  return (
    <>
      {parts.map((part, i) =>
        i % 2 === 1 ? (
          <em key={i} className={actionClassName}>
            {part}
          </em>
        ) : (
          part
        )
      )}
    </>
  );
}
